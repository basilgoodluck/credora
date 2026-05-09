from pydantic import BaseModel


class ReasoningResult(BaseModel):
    income_reasoning: str
    repayment_reasoning: str
    confidence_reasoning: str
    overall_reasoning: str
    recommendation_text: str
