from fastapi import APIRouter, Request

from gateway.core.db import db
from gateway.core.queue import enqueue_recompute_score
from shared.enums import JobStatus, JobType

router = APIRouter(prefix="/me", tags=["scoring"])


@router.post("/score")
async def trigger_score(request: Request):
    user_id = request.state.user["id"]
    job = await db.jobstatus.create(
        data={"userId": user_id, "type": JobType.RECOMPUTE_SCORE.value, "status": JobStatus.PENDING.value}
    )
    enqueue_recompute_score(user_id, job.id, countdown=1)
    return {"job_id": job.id, "status": job.status}


@router.get("/dashboard")
async def dashboard(request: Request):
    user_id = request.state.user["id"]
    latest = await db.scoresnapshot.find_first(where={"userId": user_id}, order={"createdAt": "desc"})
    history = await db.scoresnapshot.find_many(where={"userId": user_id}, order={"createdAt": "asc"}, take=12)
    evidence = await db.evidencerecord.find_many(where={"userId": user_id}, order={"createdAt": "desc"}, take=8)
    flagged = [item for item in evidence if item.fraudFlags or item.validationFlags]
    if not latest:
        return {
            "score": None,
            "grade": "Insufficient Data",
            "lender_readiness": "Upload evidence to begin scoring",
            "recommended_amount": None,
            "recommended_term_days": None,
            "financial_health": "Not enough verified activity yet",
            "income_trends": [],
            "spending_behavior": [],
            "flagged_anomalies": [],
            "recommendations": ["Upload recent SMS alerts, wallet screenshots, receipts, or repayment chats."],
            "score_history": [],
        }
    reasoning = latest.reasoning or {}
    return {
        "score": latest.overallScore,
        "grade": latest.grade,
        "lender_readiness": latest.lenderReadiness,
        "recommended_amount": str(latest.recommendedAmount) if latest.recommendedAmount else None,
        "recommended_term_days": latest.recommendedTermDays,
        "financial_health": reasoning.get("summary", "Financial health calculated from verified evidence."),
        "income_trends": (latest.metrics or {}).get("income_trends", []),
        "spending_behavior": (latest.metrics or {}).get("spending_behavior", []),
        "flagged_anomalies": [{"evidence_id": item.id, "flags": item.fraudFlags + item.validationFlags} for item in flagged],
        "recommendations": reasoning.get("recommendations", []),
        "latest_reasoning": reasoning,
        "score_history": [{"score": item.overallScore, "grade": item.grade, "created_at": item.createdAt} for item in history],
    }


@router.get("/history")
async def history(request: Request):
    user_id = request.state.user["id"]
    evidence = await db.evidencerecord.find_many(where={"userId": user_id}, order={"createdAt": "desc"}, take=100)
    events = await db.extractedevent.find_many(where={"userId": user_id}, order={"occurredAt": "desc"}, take=200)
    scores = await db.scoresnapshot.find_many(where={"userId": user_id}, order={"createdAt": "desc"}, take=50)
    return {
        "evidence": [
            {
                "id": item.id,
                "status": item.status,
                "detected_source": item.detectedSource,
                "confidence": item.confidence,
                "flags": item.validationFlags + item.fraudFlags,
                "created_at": item.createdAt,
            }
            for item in evidence
        ],
        "events": [
            {
                "id": item.id,
                "event_type": item.eventType,
                "occurred_at": item.occurredAt,
                "amount": str(item.amount) if item.amount else None,
                "currency": item.currency,
                "description": item.description,
            }
            for item in events
        ],
        "score_snapshots": [{"score": item.overallScore, "grade": item.grade, "created_at": item.createdAt} for item in scores],
    }
