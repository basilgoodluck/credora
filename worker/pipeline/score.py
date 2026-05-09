from collections import defaultdict
from statistics import mean, pstdev

from shared.models.events import NormalizedEvent


def _clamp(value: float) -> float:
    return max(0.0, min(100.0, value))


def _grade(score: int) -> str:
    if score >= 760:
        return "A"
    if score >= 680:
        return "B"
    if score >= 600:
        return "C"
    if score >= 520:
        return "D"
    return "E"


def compute_score(events: list[NormalizedEvent], evidence_count: int, fraud_flags: list[str]) -> dict:
    usable = [event for event in events if not event.flagged]
    incomes = [event for event in usable if event.event_type == "INCOME" and event.amount and event.date]
    spends = [event for event in usable if event.event_type == "SPEND" and event.amount and event.date]
    repayments = [event for event in usable if event.event_type == "REPAYMENT"]

    income_by_month: dict[str, float] = defaultdict(float)
    spend_by_month: dict[str, float] = defaultdict(float)
    for event in incomes:
        income_by_month[f"{event.date.year}-{event.date.month:02d}"] += event.amount or 0
    for event in spends:
        spend_by_month[f"{event.date.year}-{event.date.month:02d}"] += event.amount or 0

    monthly_income = list(income_by_month.values())
    avg_income = mean(monthly_income) if monthly_income else 0.0
    income_cv = (pstdev(monthly_income) / avg_income) if len(monthly_income) > 1 and avg_income else 1.0
    income_stability = _clamp((1 - min(income_cv, 1)) * 70 + min(len(monthly_income), 6) / 6 * 30)

    total_income = sum(event.amount or 0 for event in incomes)
    total_spend = sum(event.amount or 0 for event in spends)
    spending_ratio = total_spend / total_income if total_income else 1.0
    spending_discipline = _clamp((1 - min(spending_ratio, 1.2) / 1.2) * 100)

    repayment_reliability = _clamp(45 + min(len(repayments), 6) * 8) if repayments else 35
    avg_confidence = mean([event.confidence for event in usable]) if usable else 0.0
    data_confidence = _clamp(avg_confidence * 70 + min(evidence_count, 8) / 8 * 30)
    fraud_risk = _clamp(len(fraud_flags) * 18 + sum(1 for event in events if event.flagged) * 8)

    weighted = (
        income_stability * 0.25
        + spending_discipline * 0.20
        + repayment_reliability * 0.25
        + data_confidence * 0.20
        + (100 - fraud_risk) * 0.10
    )
    overall = int(round(300 + (weighted / 100) * 550))
    if evidence_count < 2 or len(events) < 3:
        overall = min(overall, 519)

    recommended_amount = round(avg_income * 0.35, 2) if overall >= 520 and avg_income else None
    recommended_term_days = 30 if overall < 680 else 60 if overall < 760 else 90

    return {
        "income_stability": round(income_stability, 2),
        "spending_discipline": round(spending_discipline, 2),
        "repayment_reliability": round(repayment_reliability, 2),
        "data_confidence": round(data_confidence, 2),
        "fraud_risk": round(fraud_risk, 2),
        "overall_score": overall,
        "grade": "Insufficient Data" if evidence_count < 2 or len(events) < 3 else _grade(overall),
        "lender_readiness": "Ready for lender review" if overall >= 600 and fraud_risk < 40 else "More evidence needed",
        "recommended_amount": recommended_amount,
        "recommended_term_days": recommended_term_days if recommended_amount else None,
        "metrics": {
            "income_trends": [{"month": key, "amount": value} for key, value in sorted(income_by_month.items())],
            "spending_behavior": [{"month": key, "amount": value} for key, value in sorted(spend_by_month.items())],
            "event_count": len(events),
            "evidence_count": evidence_count,
        },
    }
