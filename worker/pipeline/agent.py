import asyncio
import json
import os
import re
from functools import lru_cache
from typing import Any

from shared.enums import DetectedSource
from shared.models.events import NormalizedEvent
from shared.models.reasoning import ReasoningResult
from shared.models.scores import ScoreResult
from shared.models.signals import Signals
from worker.core.config import get_settings

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")


@lru_cache(maxsize=1)
def _generator():
    settings = get_settings()
    if not settings.hf_enable:
        raise RuntimeError("HuggingFace generation disabled")
    from transformers import pipeline

    device: int = -1
    if settings.hf_device == "auto":
        try:
            import torch

            device = 0 if torch.cuda.is_available() else -1
        except Exception:
            device = -1
    elif settings.hf_device not in {"cpu", "-1"}:
        device = int(settings.hf_device)
    return pipeline("text2text-generation", model=settings.hf_model, device=device)


async def _generate(prompt: str, max_new_tokens: int = 256) -> str:
    def run() -> str:
        result = _generator()(prompt, max_new_tokens=max_new_tokens, do_sample=False, truncation=True)
        return result[0]["generated_text"]

    return await asyncio.to_thread(run)


def _json_from_text(text: str) -> Any:
    clean = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    match = re.search(r"(\{.*\}|\[.*\])", clean, flags=re.S)
    return json.loads(match.group(1) if match else clean)


def _fallback_event(text: str, source: DetectedSource, confidence: float) -> list[NormalizedEvent]:
    lowered = text.lower()
    event_type = "TRANSFER"
    if any(k in lowered for k in ("repaid", "repayment", "paid back", "settled")):
        event_type = "REPAYMENT"
    elif any(k in lowered for k in ("borrowed", "loan", "debt", "owe")):
        event_type = "DECLARATION"
    elif any(k in lowered for k in ("credited", "received", "salary", "deposit", "income")):
        event_type = "INCOME"
    elif any(k in lowered for k in ("debited", "sent", "paid", "withdrawal", "purchase")):
        event_type = "SPEND"
    amount_match = re.search(r"(?:NGN|N|₦)?\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)", text, flags=re.I)
    amount = float(amount_match.group(1).replace(",", "")) if amount_match else None
    return [NormalizedEvent(event_type=event_type, amount=amount, source=source, confidence=confidence, raw_text=text[:1000])]


async def extract_events_with_agent(text: str, source: DetectedSource, confidence: float) -> list[NormalizedEvent]:
    prompt = (
        "Extract informal financial events as strict JSON array. Keys: event_type, amount, currency, date, note. "
        "event_type is INCOME, SPEND, REPAYMENT, TRANSFER, BALANCE, or DECLARATION. currency defaults NGN. "
        f"Text: {text[:3000]}"
    )
    try:
        parsed = _json_from_text(await _generate(prompt, 384))
        items = parsed if isinstance(parsed, list) else [parsed]
        events = []
        for item in items[:10]:
            if not isinstance(item, dict):
                continue
            events.append(
                NormalizedEvent(
                    event_type=str(item.get("event_type") or "TRANSFER").upper(),
                    amount=item.get("amount"),
                    currency=item.get("currency") or "NGN",
                    date=item.get("date"),
                    source=source,
                    confidence=confidence,
                    raw_text=text[:1000],
                    note=item.get("note"),
                )
            )
        return events or _fallback_event(text, source, confidence * 0.75)
    except Exception:
        return _fallback_event(text, source, confidence * 0.75)


def fallback_reasoning(score: ScoreResult, signals: Signals) -> ReasoningResult:
    income = (
        f"Average monthly income is ₦{signals.income_avg:,.0f} across {signals.months_covered} month(s), "
        f"with {signals.active_income_months} active income month(s)."
    )
    repayment = (
        f"Recorded repayments total ₦{signals.total_repayments:,.0f} against ₦{signals.total_debts:,.0f} in debt, "
        f"with {signals.repayment_count} repayment event(s)."
    )
    confidence = (
        f"The score uses {signals.total_event_count} event(s), {signals.flagged_event_count} flagged item(s), "
        f"and a longest timeline gap of {signals.longest_gap_days} day(s)."
    )
    overall = f"Overall score is {score.overall_score:.2f}, graded {score.grade}, from income stability, repayment reliability, and data confidence."
    recommendation = score.recommendation or "Insufficient data for a loan recommendation."
    return ReasoningResult(
        income_reasoning=income,
        repayment_reasoning=repayment,
        confidence_reasoning=confidence,
        overall_reasoning=overall,
        recommendation_text=recommendation,
    )


async def generate_reasoning_with_agent(score: ScoreResult, signals: Signals) -> ReasoningResult:
    prompt = (
        "Return strict JSON with keys income_reasoning, repayment_reasoning, confidence_reasoning, "
        "overall_reasoning, recommendation_text. Use only these signals and scores. "
        f"Signals: {signals.model_dump_json()} Scores: {score.model_dump_json()}"
    )
    try:
        parsed = _json_from_text(await _generate(prompt, 512))
        if isinstance(parsed, dict):
            return ReasoningResult.model_validate(parsed)
    except Exception:
        return fallback_reasoning(score, signals)
    return fallback_reasoning(score, signals)
