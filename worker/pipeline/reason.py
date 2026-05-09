from shared.models.events import NormalizedEvent


def generate_reasoning(score: dict, events: list[NormalizedEvent], fraud_flags: list[str]) -> dict:
    positives: list[str] = []
    risks: list[str] = []
    recommendations: list[str] = []

    income_months = score["metrics"].get("income_trends", [])
    repayment_count = sum(1 for event in events if event.event_type == "REPAYMENT")
    flagged_count = sum(1 for event in events if event.flagged)

    if len(income_months) >= 3:
        positives.append(f"Your income appears across {len(income_months)} months of submitted evidence.")
    if repayment_count:
        positives.append(f"{repayment_count} repayment event{'s' if repayment_count != 1 else ''} improved your trust score.")
    if score["spending_discipline"] < 45:
        risks.append("Your spending appears high compared with observed income.")
    if flagged_count:
        risks.append(f"{flagged_count} extracted event{'s' if flagged_count != 1 else ''} need more confidence.")
    if fraud_flags:
        risks.append("Some evidence contains consistency or duplication concerns.")
    if score["grade"] == "Insufficient Data":
        recommendations.append("Upload at least two recent proofs, such as wallet screenshots, SMS alerts, receipts, or repayment chats.")
    if score["fraud_risk"] >= 40:
        recommendations.append("Add clearer original documents to improve confidence and reduce fraud risk.")
    if not recommendations:
        recommendations.append("Keep adding recent financial activity to maintain an up-to-date score.")

    return {
        "summary": positives[0] if positives else "Your score is based only on the financial evidence extracted so far.",
        "positive": positives,
        "risks": risks,
        "recommendations": recommendations,
        "evidence_basis": [event.raw_text for event in events[:8] if event.raw_text],
    }
