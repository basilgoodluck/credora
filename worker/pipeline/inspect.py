from datetime import date

from shared.models.events import NormalizedEvent


def _copy(events: list[NormalizedEvent]) -> list[NormalizedEvent]:
    return [NormalizedEvent.model_validate(e.model_dump()) for e in events]


def _days(a: date | None, b: date | None) -> int | None:
    if not a or not b:
        return None
    return abs((a - b).days)


def _flag(event: NormalizedEvent, reason: str, penalty: float) -> None:
    event.flagged = True
    event.flag_reason = reason if not event.flag_reason else f"{event.flag_reason}; {reason}"
    event.confidence = max(0.1, event.confidence - penalty)


def inspect_events(events: list[NormalizedEvent], user_id: str) -> tuple[list[NormalizedEvent], list[dict]]:
    del user_id
    inspected = _copy(events)

    for i, first in enumerate(inspected):
        for second in inspected[i + 1 :]:
            if first.amount is None or second.amount is None or first.source == second.source:
                continue
            if abs(first.amount - second.amount) <= 0.01 and (_days(first.date, second.date) or 9999) <= 1:
                reason = "Possible duplicate: same amount and date from two sources"
                _flag(first, reason, 0.2)
                _flag(second, reason, 0.2)

    manual_income = sum(e.amount or 0 for e in inspected if e.event_type == "income" and e.source == "MANUAL_TEXT")
    evidence_income = sum(e.amount or 0 for e in inspected if e.event_type == "income" and e.source != "MANUAL_TEXT")
    if manual_income > 0 and evidence_income > 0 and abs(manual_income - evidence_income) / evidence_income > 0.2:
        for event in inspected:
            if event.event_type == "income" and event.source == "MANUAL_TEXT":
                _flag(event, "Declared income differs from transaction evidence by >20%", event.confidence - 0.1)

    debts = [e for e in inspected if e.event_type == "debt" and e.date]
    for event in inspected:
        if event.event_type != "repayment" or not event.date:
            continue
        matched = any(0 <= (event.date - debt.date).days <= 90 for debt in debts)
        if not matched:
            _flag(event, "Repayment recorded but no corresponding debt found", 0.15)

    dated = sorted([e for e in inspected if e.date], key=lambda e: e.date)
    gaps: list[dict] = []
    if len(dated) >= 2 and (dated[-1].date - dated[0].date).days > 60:
        for first, second in zip(dated, dated[1:]):
            days = (second.date - first.date).days
            if days > 30:
                gaps.append({"start_date": first.date.isoformat(), "end_date": second.date.isoformat(), "days": days})

    return inspected, gaps
