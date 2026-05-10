import json
from shared.models.reasoning import ReasoningResult
from worker.utils.vllm_client import generate_reasoning

async def generate_reasoning_async(score_result: dict, signals_dict: dict) -> ReasoningResult:
    try:
        result = await generate_reasoning(signals_dict, score_result)
        return ReasoningResult(
            income_reasoning=result.get("income_reasoning", "Income analysis based on provided evidence."),
            repayment_reasoning=result.get("repayment_reasoning", "Repayment behavior evaluated from transaction history."),
            confidence_reasoning=result.get("confidence_reasoning", "Data confidence derived from consistency and volume of evidence."),
            overall_reasoning=result.get("overall_reasoning", "Overall score reflects financial stability and reliability."),
            recommendation_text=result.get("recommendation_text", "Continue adding recent financial activity to improve score.")
        )
    except Exception:
        return ReasoningResult(
            income_reasoning="Unable to generate reasoning at this time.",
            repayment_reasoning="Unable to generate reasoning at this time.",
            confidence_reasoning="Unable to generate reasoning at this time.",
            overall_reasoning="Score computed from submitted evidence.",
            recommendation_text="Please upload additional documents for better assessment."
        )

def generate_reasoning(score_result: dict, signals_dict: dict) -> ReasoningResult:
    import asyncio
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    if loop and loop.is_running():
        raise RuntimeError("Use generate_reasoning_async in async context")
    return asyncio.run(generate_reasoning_async(score_result, signals_dict))