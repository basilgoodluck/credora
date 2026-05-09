from fastapi import APIRouter, HTTPException, Request

from gateway.core.db import db

router = APIRouter(prefix="/me", tags=["me"])


@router.get("")
async def get_me(request: Request):
    user = await db.user.find_unique(where={"id": request.state.user["id"]})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    return {
        "id": user.id,
        "phone_number": user.phoneNumber,
        "full_name": user.fullName,
        "country_code": user.countryCode,
        "primary_work_type": user.primaryWorkType,
        "onboarding_completed": user.onboardingCompletedAt is not None,
        "created_at": user.createdAt,
    }
