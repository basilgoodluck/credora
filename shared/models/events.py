from datetime import date as Date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from shared.enums import DetectedSource

EventType = Literal["INCOME", "SPEND", "REPAYMENT", "TRANSFER", "BALANCE", "DECLARATION"]


class NormalizedEvent(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    event_type: EventType
    amount: float | None = None
    currency: str = "NGN"
    date: Date | None = None
    source: DetectedSource = DetectedSource.UNKNOWN
    confidence: float = Field(default=0.0)
    raw_text: str | None = None
    note: str | None = None
    flagged: bool = False
    flag_reason: str | None = None

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, value: float | int | None) -> float:
        if value is None:
            return 0.0
        return max(0.0, min(1.0, float(value)))

    @field_validator("amount", mode="before")
    @classmethod
    def clean_amount(cls, value: float | int | str | None) -> float | None:
        if value in (None, ""):
            return None
        amount = float(str(value).replace(",", "").replace("₦", "").replace("NGN", "").replace("N", "").strip())
        return amount if amount >= 0 else abs(amount)
