import asyncio
from decimal import Decimal
from datetime import UTC, datetime
from typing import Any

import redis.asyncio as redis

from shared.enums import JobStatus
from shared.models.events import NormalizedEvent
from worker.core.config import get_settings
from worker.core.db import connect_db, db
from worker.pipeline.reason import generate_reasoning
from worker.pipeline.score import compute_score
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


async def _redis():
    return redis.Redis.from_url(get_settings().redis_url, decode_responses=True)


async def schedule_recompute(user_id: str, job_id: str | None, countdown: int = 45) -> str:
    client = await _redis()
    key = f"recompute:{user_id}"
    previous = await client.get(key)
    if previous:
        celery_app.control.revoke(previous, terminate=False)
    task = celery_app.send_task("worker.jobs.recompute_score.recompute_score", args=[user_id, job_id], countdown=countdown)
    await client.set(key, task.id, ex=max(600, countdown + 300))
    await client.aclose()
    return task.id


async def _mark_job(job_id: str | None, status: JobStatus, error: str | None = None) -> None:
    if not job_id:
        return
    data: dict[str, Any] = {"status": status.value}
    if status == JobStatus.PROCESSING:
        data["startedAt"] = datetime.now(UTC)
        data["progress"] = 25
    if status == JobStatus.COMPLETE:
        data["completedAt"] = datetime.now(UTC)
        data["progress"] = 100
    if error:
        data["errorCode"] = "SCORING_FAILED"
        data["errorMessage"] = error[:1000]
    await db.jobstatus.update(where={"id": job_id}, data=data)


async def _recompute(user_id: str, job_id: str | None, task_id: str) -> dict[str, str]:
    await connect_db()
    client = await _redis()
    key = f"recompute:{user_id}"
    current = await client.get(key)
    if current and current != task_id and job_id is None:
        await client.aclose()
        return {"status": "skipped"}

    await _mark_job(job_id, JobStatus.PROCESSING)
    evidence = await db.evidencerecord.find_many(where={"userId": user_id})
    rows = await db.extractedevent.find_many(where={"userId": user_id})
    events = [_event_from_row(row) for row in rows]
    fraud_flags = sorted({flag for item in evidence for flag in (item.fraudFlags or [])})
    score = compute_score(events, len(evidence), fraud_flags)
    reasoning = generate_reasoning(score, events, fraud_flags)

    await db.scoresnapshot.create(
        data={
            "userId": user_id,
            "incomeStability": score["income_stability"],
            "spendingDiscipline": score["spending_discipline"],
            "repaymentReliability": score["repayment_reliability"],
            "dataConfidence": score["data_confidence"],
            "fraudRisk": score["fraud_risk"],
            "overallScore": score["overall_score"],
            "grade": score["grade"],
            "lenderReadiness": score["lender_readiness"],
            "recommendedAmount": Decimal(str(score["recommended_amount"])) if score["recommended_amount"] is not None else None,
            "recommendedTermDays": score["recommended_term_days"],
            "reasoning": reasoning,
            "metrics": score["metrics"],
        }
    )
    await _mark_job(job_id, JobStatus.COMPLETE)
    if current == task_id:
        await client.delete(key)
    await client.aclose()
    return {"status": "complete"}


async def _mark_failed(job_id: str | None, error: str) -> None:
    await connect_db()
    await _mark_job(job_id, JobStatus.FAILED, error)


@celery_app.task(
    name="worker.jobs.recompute_score.recompute_score",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=30,
    max_retries=3,
)
def recompute_score(self, user_id: str, job_id: str | None = None):
    try:
        return asyncio.run(_recompute(user_id, job_id, self.request.id))
    except Exception as exc:
        if self.request.retries >= self.max_retries:
            asyncio.run(_mark_failed(job_id, str(exc)))
        raise
