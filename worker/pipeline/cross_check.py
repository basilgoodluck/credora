from collections import Counter
from datetime import date

from shared.models.events import NormalizedEvent


def cross_check(new_events: list[NormalizedEvent], previous_events: list[NormalizedEvent]) -> tuple[list[NormalizedEvent], list[str]]:
    flags: list[str] = []
    seen = Counter(
        (
            event.event_type,
            round(event.amount or 0, 2),
            event.date.isoformat() if event.date else "",
            event.source,
        )
        for event in previous_events
    )
    checked: list[NormalizedEvent] = []
    for event in new_events:
        key = (
            event.event_type,
            round(event.amount or 0, 2),
            event.date.isoformat() if event.date else "",
            event.source,
        )
        if seen[key]:
            event.flagged = True
            event.flag_reason = "Possible duplicate financial event"
            flags.append("possible_duplicate_event")
        checked.append(event)

    dated = sorted([event.date for event in previous_events + new_events if event.date])
    for before, after in zip(dated, dated[1:]):
        days = (after - before).days
        if days > 60:
            flags.append(f"timeline_gap_{days}_days")

    income = sum(event.amount or 0 for event in previous_events + new_events if event.event_type == "INCOME")
    spend = sum(event.amount or 0 for event in previous_events + new_events if event.event_type == "SPEND")
    if income > 0 and spend > income * 1.8:
        flags.append("spending_exceeds_observed_capacity")

    declarations = [
        event for event in previous_events + new_events if event.event_type == "DECLARATION" and event.amount and event.date
    ]
    declared_by_month: dict[tuple[int, int], list[float]] = {}
    for event in declarations:
        assert isinstance(event.date, date)
        declared_by_month.setdefault((event.date.year, event.date.month), []).append(event.amount or 0)
    if any(max(values) > min(values) * 1.5 for values in declared_by_month.values() if len(values) > 1 and min(values) > 0):
        flags.append("contradictory_income_claims")

    return checked, sorted(set(flags))
