import asyncio
from typing import Any, List
from shared.enums import DetectedSource
from shared.models.events import NormalizedEvent
from worker.utils.vllm_client import extract_events_from_image, extract_events_from_pdf
import httpx
from worker.core.config import get_settings

settings = get_settings()

def _field(record: Any, key: str, default: Any = None) -> Any:
    return record.get(key, default) if isinstance(record, dict) else getattr(record, key, default)

async def download_file(url: str) -> bytes:
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content

async def scan_evidence(evidence: Any) -> tuple[DetectedSource, List[NormalizedEvent], str]:
    # Determine input type from evidence fields
    file_url = _field(evidence, "fileUrl") or _field(evidence, "file_url")
    raw_text = _field(evidence, "rawText") or ""
    mime_type = _field(evidence, "mimeType") or _field(evidence, "mime_type")
    source_type = _field(evidence, "sourceType") or _field(evidence, "source_type")

    extracted_events = []
    combined_text = raw_text

    if file_url:
        data = await download_file(file_url)
        if mime_type and mime_type.startswith("image/"):
            events_dict = await extract_events_from_image(data, mime_type)
        elif mime_type == "application/pdf":
            events_dict = await extract_events_from_pdf(data)
        else:
            # fallback: treat as text if possible
            events_dict = []
        # Convert dicts to NormalizedEvent objects
        for ev in events_dict:
            extracted_events.append(NormalizedEvent(
                event_type=ev.get("event_type", "unknown"),
                amount=ev.get("amount"),
                date=ev.get("date"),
                source=DetectedSource(source_type) if source_type else DetectedSource.UNKNOWN,
                confidence=ev.get("confidence", 0.6),
                raw_text=ev.get("description") or ev.get("raw_text"),
                counterparty=ev.get("counterparty"),
            ))
        combined_text = f"{raw_text}\n{str(events_dict)}"  # for logging

    # If no file_url but raw_text exists, treat as text prompt
    if raw_text and not file_url:
        # Use vLLM text extraction (call same function but with text prompt)
        from worker.utils.vllm_client import call_vllm
        prompt = f"Extract financial transactions from this text. Return JSON array with fields: amount, date (YYYY-MM-DD), event_type (income/repayment/spend/balance), counterparty, description, confidence.\nText: {raw_text}"
        resp = await call_vllm([{"role": "user", "content": prompt}])
        import json
        events_dict = json.loads(resp)
        for ev in events_dict:
            extracted_events.append(NormalizedEvent(
                event_type=ev.get("event_type", "unknown"),
                amount=ev.get("amount"),
                date=ev.get("date"),
                source=DetectedSource(source_type) if source_type else DetectedSource.MANUAL_NOTE,
                confidence=ev.get("confidence", 0.5),
                raw_text=ev.get("description"),
                counterparty=ev.get("counterparty"),
            ))

    # Classify source based on content or fallback
    # You can keep classify_source function from original or derive from source_type
    if not source_type:
        source_type = "UNKNOWN"
    source = DetectedSource(source_type) if isinstance(source_type, str) else DetectedSource.UNKNOWN

    return source, extracted_events, combined_text