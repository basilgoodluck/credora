from pydantic import BaseModel, Field


class Signals(BaseModel):
    monthly_incomes: list[float] = Field(default_factory=list)
    monthly_expenses: list[float] = Field(default_factory=list)
    monthly_net: list[float] = Field(default_factory=list)
    income_avg: float = 0.0
    income_stddev: float = 0.0
    expense_avg: float = 0.0
    activity_frequency: float = 0.0
    income_event_count: int = 0
    expense_event_count: int = 0
    total_debts: float = 0.0
    total_repayments: float = 0.0
    repayment_count: int = 0
    debt_count: int = 0
    unresolved_debts: float = 0.0
    avg_days_to_repay: float = 0.0
    longest_gap_days: int = 0
    flagged_event_count: int = 0
    total_event_count: int = 0
    months_covered: int = 0
    active_income_months: int = 0
