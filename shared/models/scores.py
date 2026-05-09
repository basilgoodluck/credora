from typing import Literal

from pydantic import BaseModel, Field, field_validator

from shared.models.signals import Signals

Grade = Literal["Strong", "Moderate", "Developing", "Insufficient data"]


class ScoreResult(BaseModel):
    income_stability: float = Field(default=0.0)
    repayment_reliability: float = Field(default=0.0)
    data_confidence: float = Field(default=0.0)
    overall_score: float = Field(default=0.0)
    grade: Grade = "Insufficient data"
    recommended_amount: str | None = None
    recommended_term: str | None = None
    recommendation: str | None = None
    signals: Signals = Field(default_factory=Signals)

    @field_validator("income_stability", "repayment_reliability", "data_confidence", "overall_score", mode="before")
    @classmethod
    def clamp(cls, value: float | int | None) -> float:
        if value is None:
            return 0.0
        return round(max(0.0, min(1.0, float(value))), 4)
