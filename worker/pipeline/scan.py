import asyncio
import re
from io import BytesIO
from pathlib import Path
from typing import Any

from dateutil import parser as date_parser

from shared.enums import DetectedSource
from shared.models.events import NormalizedEvent
from worker.core.config import get_settings

AMOUNT_RE = re.compile(r"(?:NGN|N|₦)?\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)", re.I)
DATE_RE = re.compile(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|20\d{2}-\d{1,2}-\d{1,2})\b")


def _field(record: Any, key: str, default: Any = None) -> Any:
    return record.get(key, default) if isinstance(record, dict) else getattr(record, key, default)


def _parse_amount(value: str | None) -> float | None:
    return float(value.replace(",", "")) if value else None


def _parse_date(text: str | None):
    if not text:
        return None
    match = DATE_RE.search(text)
    if not match:
        return None
    try:
        return date_parser.parse(match.group(0), dayfirst=True, fuzzy=True).date()
    except Exception:
        return None


def classify_source(text: str, mime_type: str | None) -> DetectedSource:
    clean = text.lower()
    if "opay" in clean:
        return DetectedSource.OPAY_SCREENSHOT
    if "palmpay" in clean:
        return DetectedSource.PALMPAY_SCREENSHOT
    if "moniepoint" in clean:
        return DetectedSource.MONIEPOINT_SCREENSHOT
    if "kuda" in clean:
        return DetectedSource.KUDA_SCREENSHOT
    if "whatsapp" in clean or "voice call" in clean or "last seen" in clean:
        return DetectedSource.WHATSAPP_REPAYMENT_CHAT
    if "credited" in clean or "debited" in clean or "available balance" in clean:
        return DetectedSource.BANK_SMS
    if mime_type == "application/pdf":
        return DetectedSource.BANK_STATEMENT
    if mime_type and (mime_type.startswith("video/") or mime_type.startswith("audio/")):
        return DetectedSource.UNKNOWN
    if "receipt" in clean:
        return DetectedSource.RECEIPT
    if "teller" in clean or "deposit slip" in clean:
        return DetectedSource.TELLER_SLIP
    return DetectedSource.MANUAL_NOTE if text else DetectedSource.UNKNOWN


def _event_type_for(line: str) -> str:
    clean = line.lower()
    if any(word in clean for word in ("repaid", "repayment", "paid back", "settled")):
        return "REPAYMENT"
    if any(word in clean for word in ("credited", "received", "deposit", "cash in", "salary", "sales")):
        return "INCOME"
    if any(word in clean for word in ("debited", "sent", "paid", "withdrawal", "purchase", "cash out")):
        return "SPEND"
    if "balance" in clean:
        return "BALANCE"
    return "TRANSFER"


def _regex_extract(text: str, source: DetectedSource, confidence: float) -> list[NormalizedEvent]:
    events: list[NormalizedEvent] = []
    global_date = _parse_date(text)
    for line in [line.strip() for line in text.splitlines() if line.strip()] or [text]:
        for amount_text in AMOUNT_RE.findall(line)[:3]:
            events.append(
                NormalizedEvent(
                    event_type=_event_type_for(line),
                    amount=_parse_amount(amount_text),
                    date=_parse_date(line) or global_date,
                    source=source,
                    confidence=confidence,
                    raw_text=line[:1000],
                )
            )
    return events


async def _ocr_image(data: bytes) -> str:
    def run() -> str:
        from PIL import Image
        import pytesseract

        image = Image.open(BytesIO(data)).convert("L")
        return pytesseract.image_to_string(image)

    try:
        return await asyncio.to_thread(run)
    except Exception:
        return ""


async def _extract_pdf(data: bytes) -> str:
    def run() -> str:
        import pdfplumber

        text: list[str] = []
        with pdfplumber.open(BytesIO(data)) as pdf:
            for page in pdf.pages:
                text.append(page.extract_text() or "")
        return "\n".join(text)

    try:
        return await asyncio.to_thread(run)
    except Exception:
        return ""


def _read_private_file(storage_key: str | None) -> bytes | None:
    if not storage_key:
        return None
    path = Path(get_settings().storage_root) / storage_key
    if not path.exists():
        return None
    return path.read_bytes()


async def scan_evidence(evidence: Any) -> tuple[DetectedSource, list[NormalizedEvent], str]:
    raw_text = _field(evidence, "rawText") or ""
    data = _read_private_file(_field(evidence, "storageKey"))
    mime_type = _field(evidence, "mimeType")
    extracted_text = ""
    if data and mime_type == "application/pdf":
        extracted_text = await _extract_pdf(data)
    elif data and mime_type and mime_type.startswith("image/"):
        extracted_text = await _ocr_image(data)

    combined_text = "\n".join(part for part in [raw_text, extracted_text] if part).strip()
    source = classify_source(combined_text, mime_type)
    confidence = 0.9 if source in {DetectedSource.BANK_SMS, DetectedSource.BANK_STATEMENT} else 0.65
    events = _regex_extract(combined_text, source, confidence)
    if not events and combined_text:
        events = [NormalizedEvent(event_type="DECLARATION", source=source, confidence=0.35, raw_text=combined_text[:1000])]
    return source, events, combined_text
