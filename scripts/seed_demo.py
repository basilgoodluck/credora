import asyncio
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from prisma import Prisma
from prisma import Json
from gateway.core.security import hash_secret

PHONE = "+2347073282729"


async def main() -> None:
    db = Prisma()
    await db.connect()

    now = datetime.now(UTC)

    # -------------------------
    # USER
    # -------------------------
    user = await db.user.find_unique(where={"phoneNumber": PHONE})

    if not user:
        user = await db.user.create(
            data={
                "phoneNumber": PHONE,
                "passwordHash": hash_secret("Password123!"),
                "fullName": "Amina Balogun",
                "countryCode": "NG",
                "primaryWorkType": "Market trader",
                "onboardingCompletedAt": now - timedelta(days=92),
            }
        )
    else:
        user = await db.user.update(
            where={"id": user.id},
            data={
                "passwordHash": user.passwordHash or hash_secret("Password123!"),
                "fullName": "Amina Balogun",
                "countryCode": "NG",
                "primaryWorkType": "Market trader",
                "onboardingCompletedAt": user.onboardingCompletedAt or (now - timedelta(days=92)),
            },
        )

    # -------------------------
    # INVESTIGATION CASES
    # -------------------------
    existing_cases = await db.investigationcase.find_many(
        where={"user": {"is": {"id": user.id}}}
    )

    if not existing_cases:
        categories = [
            ("Loan default", "Missed cooperative loan repayment", 82, "HIGH", Decimal("450000")),
            ("Identity mismatch", "BVN name differs from wallet records", 71, "HIGH", None),
            ("Payment dispute", "Customer claims April 12 repayment", 64, "MEDIUM", Decimal("125000")),
            ("Chargeback", "Reversed POS settlement under review", 58, "MEDIUM", Decimal("87000")),
            ("Fraud investigation", "Repeated round-number transfers", 88, "CRITICAL", Decimal("920000")),
            ("Income verification", "Market stall receipts under validation", 36, "LOW", Decimal("310000")),
            ("Document review", "Loan agreement and guarantor form attached", 42, "LOW", Decimal("250000")),
            ("Transaction anomaly", "Weekend cash-outs exceed observed average", 77, "HIGH", Decimal("640000")),
            ("Repayment review", "Three repayment screenshots validated", 29, "LOW", Decimal("180000")),
            ("Merchant dispute", "Supplier invoice total conflicts with transfer log", 69, "MEDIUM", Decimal("215000")),
            ("KYC escalation", "Address proof is older than policy window", 53, "MEDIUM", None),
            ("Wallet audit", "OPay and Moniepoint inflows reconciled", 33, "LOW", Decimal("510000")),
        ]

        for index, (category, title, risk, priority, amount) in enumerate(categories, start=1):

            flags = []
            if risk > 70:
                flags = ["duplicate_pattern", "timeline_gap"]
            elif risk > 50:
                flags = ["manual_review"]

            timeline = [
                {
                    "date": (now - timedelta(days=index * 5)).date().isoformat(),
                    "label": "Evidence received",
                    "detail": "File accepted by evidence gateway.",
                },
                {
                    "date": (now - timedelta(days=index * 5 - 1)).date().isoformat(),
                    "label": "AI extraction complete",
                    "detail": "Events normalized and scored.",
                },
                {
                    "date": (now - timedelta(days=index * 5 - 2)).date().isoformat(),
                    "label": "Analyst note added",
                    "detail": "Case context reviewed.",
                },
            ]

            await db.investigationcase.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "caseNumber": f"CQ-NG-2026-{index:04d}",
                    "title": title,
                    "category": category,
                    "status": ["OPEN", "INVESTIGATING", "EVIDENCE_REVIEW", "RESOLVED"][index % 4],
                    "priority": priority,
                    "riskScore": risk,
                    "amount": amount,
                    "summary": f"{category} case generated from uploaded evidence, transaction history, analyst notes, and timeline checks.",
                    "flags": Json(flags),
                    "timeline": Json(timeline),
                    "createdAt": now - timedelta(days=index * 5),
                }
            )

    # -------------------------
    # EVIDENCE
    # -------------------------
    evidence_specs = [
        ("opay_april_statement.pdf", "application/pdf", "OPAY_SCREENSHOT", ["validated_statement"]),
        ("moniepoint_pos_settlement.csv", "text/csv", "BANK_STATEMENT", ["settlement_reconciled"]),
        ("market_receipt_batch.png", "image/png", "RECEIPT", []),
        ("repayment_video_clip.mp4", "video/mp4", "UNKNOWN", ["media_review_required"]),
        ("customer_call_recording.m4a", "audio/mp4", "UNKNOWN", ["voice_evidence"]),
        ("loan_agreement.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "UNKNOWN", ["contract_attached"]),
    ]

    existing_evidence = await db.evidencerecord.find_many(
        where={"user": {"is": {"id": user.id}}}
    )

    if len(existing_evidence) < len(evidence_specs):
        for index, (filename, mime, source, flags) in enumerate(evidence_specs):

            evidence = await db.evidencerecord.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "status": "COMPLETE",
                    "originalFilename": filename,
                    "mimeType": mime,
                    "fileSizeBytes": 180000 + index * 43000,
                    "storageKey": f"demo/{user.id}/{filename}",
                    "fileSha256": f"demo-seed-{index}-{user.id}",
                    "note": [
                        "Customer claims payment was made on April 12.",
                        "Suspicious transfer pattern observed.",
                        "Loan agreement attached.",
                    ][index % 3],
                    "detectedSource": source,
                    "validationFlags": Json(flags),
                    "fraudFlags": Json(["round_number_cadence"] if index == 3 else []),
                    "confidence": 0.72 + index * 0.03,
                    "processedAt": now - timedelta(days=index + 2),
                    "createdAt": now - timedelta(days=index + 3),
                }
            )

            for month in range(1, 7):
                await db.extractedevent.create(
                    data={
                        "user": {"connect": {"id": user.id}},
                        "evidence": {"connect": {"id": evidence.id}},
                        "eventType": "INCOME" if month % 2 else "SPEND",
                        "occurredAt": now - timedelta(days=month * 18 + index),
                        "amount": Decimal(str(85000 + month * 12000 + index * 2500)),
                        "currency": "NGN",
                        "channel": source,
                        "description": f"Seeded {source.lower()} financial activity for month {month}.",
                        "sourceConfidence": 0.76,
                        "normalizedData": Json({"source": source, "flagged": False}),
                    }
                )

    # -------------------------
    # SCORES
    # -------------------------
    if not await db.scoresnapshot.find_first(where={"user": {"is": {"id": user.id}}}):
        for idx, score in enumerate([604, 618, 641, 672, 698, 724]):

            await db.scoresnapshot.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "incomeStability": 78 + idx,
                    "spendingDiscipline": 61 + idx,
                    "repaymentReliability": 70 + idx,
                    "dataConfidence": 74 + idx,
                    "fraudRisk": max(18, 42 - idx * 4),
                    "overallScore": score,
                    "grade": "B" if score >= 680 else "C",
                    "lenderReadiness": "Ready for lender review" if score >= 680 else "More evidence recommended",
                    "recommendedAmount": Decimal("350000") + Decimal(idx * 25000),
                    "recommendedTermDays": 60,
                    "reasoning": Json({
                        "summary": "Income appears consistent across wallet, receipt, and settlement evidence.",
                        "positive": [
                            "Six months of income activity found.",
                            "Repayment screenshots improved trust score.",
                        ],
                        "risks": ["Two cases still require analyst review."],
                        "recommendations": ["Upload original bank statement for the last 30 days."],
                    }),
                    "metrics": Json({
                        "income_trends": [{"month": f"2026-0{m}", "amount": 120000 + m * 18000} for m in range(1, 7)],
                        "spending_behavior": [{"month": f"2026-0{m}", "amount": 68000 + m * 9000} for m in range(1, 7)],
                    }),
                    "createdAt": now - timedelta(days=(6 - idx) * 10),
                }
            )

    # -------------------------
    # NOTIFICATIONS
    # -------------------------
    if not await db.notification.find_first(where={"user": {"is": {"id": user.id}}}):
        for title, body, tone in [
            ("High-risk case opened", "Repeated round-number transfers require review.", "danger"),
            ("Evidence processed", "Moniepoint settlement file was normalized successfully.", "success"),
            ("Report ready", "Lender credibility report is ready for export.", "info"),
            ("KYC verified", "Nigerian identity profile is active and verified.", "success"),
        ]:
            await db.notification.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "title": title,
                    "body": body,
                    "tone": tone,
                }
            )

    await db.disconnect()
    print(f"Seeded demo workspace for {PHONE}. Password: Password123!")


if __name__ == "__main__":
    asyncio.run(main())