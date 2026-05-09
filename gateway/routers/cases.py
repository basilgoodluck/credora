from fastapi import APIRouter, Request

from gateway.core.db import db

router = APIRouter(prefix="/me", tags=["cases"])


@router.get("/cases")
async def list_cases(request: Request):
    cases = await db.investigationcase.find_many(where={"userId": request.state.user["id"]}, order={"createdAt": "desc"}, take=50)
    return [
        {
            "id": item.id,
            "case_number": item.caseNumber,
            "title": item.title,
            "category": item.category,
            "status": item.status,
            "priority": item.priority,
            "risk_score": item.riskScore,
            "amount": str(item.amount) if item.amount else None,
            "currency": item.currency,
            "summary": item.summary,
            "flags": item.flags,
            "timeline": item.timeline,
            "created_at": item.createdAt,
        }
        for item in cases
    ]


@router.get("/notifications")
async def notifications(request: Request):
    items = await db.notification.find_many(where={"userId": request.state.user["id"]}, order={"createdAt": "desc"}, take=20)
    return [
        {
            "id": item.id,
            "title": item.title,
            "body": item.body,
            "tone": item.tone,
            "read_at": item.readAt,
            "created_at": item.createdAt,
        }
        for item in items
    ]
