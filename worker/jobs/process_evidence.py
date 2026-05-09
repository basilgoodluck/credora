import asyncio
from decimal import Decimal
from datetime import UTC, datetime
from typing import Any

from shared.enums import EvidenceStatus, JobStatus
from shared.models.events import NormalizedEvent
from worker.core.db import connect_db, db
from worker.jobs.recompute_score import schedule_recompute
from worker.pipeline.cross_check import cross_check
from worker.pipeline.scan import scan_evidence
from worker.queue.celery_app import celery_app


def _event_from_row(row: Any) -> NormalizedEvent:
    data = row.normalizedData or {}
    return NormalizedEvent(
        event_type=row.eventType,
        amount=float(row.amount) if row.amount is not None else None,
        currency=row.currency,
        date=row.occurredAt.date() if row.occurredAt else None,
        source=data.get("source") or "UNKNOWN",
        confidence=row.sourceConfidence,
        raw_text=row.description,
        flagged=data.get("flagged", False),
        flag_reason=data.get("flag_reason"),
    )


async def _mark_failed(evidence_id: str, job_id: str, error: str) -> None:
    await connect_db()
    await db.evidencerecord.update(
        where={"id": evidence_id},
        data={"status": EvidenceStatus.FAILED.value, "errorCode": "PROCESSING_FAILED"},
    )
    await db.jobstatus.update(
        where={"id": job_id},
        data={"status": JobStatus.FAILED.value, "errorCode": "PROCESSING_FAILED", "errorMessage": error[:1000]},
    )


async def _process(evidence_id: str, job_id: str) -> dict[str, str]:
    await connect_db()
    await db.jobstatus.update(where={"id": job_id}, data={"status": JobStatus.PROCESSING.value, "progress": 10, "startedAt": datetime.now(UTC)})
    evidence = await db.evidencerecord.find_unique(where={"id": evidence_id})
    if not evidence:
        raise ValueError("Evidence not found")

    await db.evidencerecord.update(where={"id": evidence_id}, data={"status": EvidenceStatus.PROCESSING.value})
    previous_rows = await db.extractedevent.find_many(where={"userId": evidence.userId})
    previous_events = [_event_from_row(row) for row in previous_rows]

    source, events, extracted_text = await scan_evidence(evidence)
    checked_events, flags = cross_check(events, previous_events)
    status = EvidenceStatus.NEEDS_REVIEW.value if flags or any(event.flagged for event in checked_events) else EvidenceStatus.COMPLETE.value

    async with db.tx() as tx:
        for event in checked_events:
            await tx.extractedevent.create(
                data={
                    "userId": evidence.userId,
                    "evidenceId": evidence.id,
                    "eventType": event.event_type,
                    "occurredAt": datetime.combine(event.date, datetime.min.time(), tzinfo=UTC) if event.date else None,
                    "amount": Decimal(str(event.amount)) if event.amount is not None else None,
                    "currency": event.currency,
                    "counterparty": None,
                    "channel": event.source,
                    "description": event.raw_text,
                    "sourceConfidence": event.confidence,
                    "normalizedData": {
                        "source": event.source,
                        "flagged": event.flagged,
                        "flag_reason": event.flag_reason,
                        "note": event.note,
                    },
                }
            )
        await tx.evidencerecord.update(
            where={"id": evidence.id},
            data={
                "status": status,
                "detectedSource": source.value if hasattr(source, "value") else str(source),
                "fraudFlags": flags,
                "confidence": min([event.confidence for event in checked_events], default=0.0),
                "processedAt": datetime.now(UTC),
                "rawText": extracted_text or evidence.rawText,
            },
        )
        await tx.jobstatus.update(
            where={"id": job_id},
            data={"status": JobStatus.COMPLETE.value, "progress": 100, "completedAt": datetime.now(UTC)},
        )

    await schedule_recompute(evidence.userId, None, countdown=45)
    return {"status": "complete"}


@celery_app.task(
    name="worker.jobs.process_evidence.process_evidence",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=30,
    max_retries=3,
)
def process_evidence(self, evidence_id: str, job_id: str):
    try:
        return asyncio.run(_process(evidence_id, job_id))
    except Exception as exc:
        if self.request.retries >= self.max_retries:
            asyncio.run(_mark_failed(evidence_id, job_id, str(exc)))
        raise
