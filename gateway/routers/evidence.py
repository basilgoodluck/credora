import hashlib
import prisma  # <-- ADDED
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from gateway.core.config import get_settings
from gateway.core.db import db
from gateway.core.queue import enqueue_process_evidence
from shared.enums import EvidenceStatus, JobStatus, JobType

router = APIRouter(prefix="/me/evidence", tags=["evidence"])

ALLOWED_MIME = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "application/pdf": {".pdf"},
    "application/msword": {".doc"},
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {".docx"},
    "text/csv": {".csv"},
    "application/csv": {".csv"},
    "application/vnd.ms-excel": {".xls", ".csv"},
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {".xlsx"},
    "video/mp4": {".mp4"},
    "video/quicktime": {".mov"},
    "video/x-msvideo": {".avi"},
    "video/webm": {".webm"},
    "audio/mpeg": {".mp3"},
    "audio/wav": {".wav"},
    "audio/x-wav": {".wav"},
    "audio/mp4": {".m4a"},
    "audio/x-m4a": {".m4a"},
    "application/octet-stream": {".bin"},
}
MALWARE_SIGNATURES = (b"EICAR-STANDARD-ANTIVIRUS-TEST-FILE",)


def _validate_magic(mime_type: str, data: bytes) -> None:
    if mime_type == "application/pdf" and not data.startswith(b"%PDF"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The PDF appears to be corrupted")
    if mime_type == "image/png" and not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The image appears to be corrupted")
    if mime_type == "image/jpeg" and not data.startswith(b"\xff\xd8"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The image appears to be corrupted")
    if mime_type == "image/webp" and not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The image appears to be corrupted")
    if mime_type.endswith("spreadsheetml.sheet") and not data.startswith(b"PK"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The spreadsheet appears to be corrupted")
    if mime_type.endswith("wordprocessingml.document") and not data.startswith(b"PK"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The document appears to be corrupted")


def _scan_malware(data: bytes) -> None:
    if any(signature in data for signature in MALWARE_SIGNATURES):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The file failed security scanning")


async def _store_private(user_id: str, evidence_id: str, filename: str, data: bytes) -> str:
    root = Path(get_settings().storage_root)
    extension = Path(filename).suffix.lower()
    key = f"{user_id}/{evidence_id}{extension}"
    path = root / key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return key


@router.post("")
async def upload_evidence(
    request: Request,
    file: UploadFile = File(...),
    note: str | None = Form(default=None),
):
    user_id = request.state.user["id"]
    clean_note = note.strip() if note else None

    filename = file.filename or "evidence"
    extension = Path(filename).suffix.lower()
    mime_type = file.content_type or "application/octet-stream"
    if mime_type not in ALLOWED_MIME or extension not in ALLOWED_MIME[mime_type]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported evidence format")
    file_bytes = await file.read()
    file_size = len(file_bytes)
    if file_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is empty")
    if file_size > get_settings().max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File is too large")
    _validate_magic(mime_type, file_bytes)
    _scan_malware(file_bytes)
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    duplicate = await db.evidencerecord.find_first(
        where={"userId": user_id, "fileSha256": file_hash, "status": {"in": ["PROCESSING", "COMPLETE", "NEEDS_REVIEW"]}}
    )
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This evidence was already uploaded")

    async with db.tx() as tx:
        evidence = await tx.evidencerecord.create(
            data={
                "user": {"connect": {"id": user_id}},
                "status": EvidenceStatus.PENDING.value,
                "originalFilename": filename,
                "mimeType": mime_type,
                "fileSizeBytes": file_size,
                "fileSha256": file_hash,
                "rawText": None,
                "note": clean_note,
                "validationFlags": prisma.Json([]),   # FIXED
                "fraudFlags": prisma.Json([]),        # FIXED
            }
        )
        storage_key = await _store_private(user_id, evidence.id, filename, file_bytes)
        evidence = await tx.evidencerecord.update(where={"id": evidence.id}, data={"storageKey": storage_key})
        job = await tx.jobstatus.create(
            data={
                "userId": user_id,   # FIXED: use scalar, not relation
                "evidenceId": evidence.id,
                "type": JobType.PROCESS_EVIDENCE.value,
                "status": JobStatus.PENDING.value,
            }
        )

    enqueue_process_evidence(evidence.id, job.id)
    return {"evidence_id": evidence.id, "job_id": job.id, "status": JobStatus.PENDING.value}