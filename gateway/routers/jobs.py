from fastapi import APIRouter, HTTPException, Request

from gateway.core.db import db

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}")
async def get_job(job_id: str, request: Request):
    job = await db.jobstatus.find_first(where={"id": job_id, "userId": request.state.user["id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "type": job.type,
        "status": job.status,
        "progress": job.progress,
        "error_code": job.errorCode,
        "error_message": job.errorMessage,
        "created_at": job.createdAt,
        "completed_at": job.completedAt,
    }
