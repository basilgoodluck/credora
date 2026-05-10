import httpx
import base64
import json
from typing import List, Dict, Any
from worker.core.config import get_settings

settings = get_settings()

async def call_vllm(messages: List[Dict[str, Any]], temperature: float = 0.0, max_tokens: int = 2000) -> str:
    headers = {
        "Authorization": f"Bearer {settings.vllm_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.vllm_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"}
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{settings.vllm_endpoint}/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

async def extract_events_from_image(image_bytes: bytes, mime_type: str) -> List[Dict]:
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_image}"
    messages = [
        {
            "role": "system",
            "content": "You extract financial transactions from images (receipts, SMS screenshots, bank statements, handwritten notes). Return ONLY valid JSON array of objects with fields: amount (float or null), date (YYYY-MM-DD or null), event_type (one of: income, repayment, spend, balance, unknown), counterparty (string or null), description (string or null), confidence (float 0-1). If no transactions, return []."
        },
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": "Extract all financial transactions from this image. Return JSON array."}
            ]
        }
    ]
    resp_text = await call_vllm(messages, max_tokens=1500)
    return json.loads(resp_text)

async def extract_events_from_pdf(pdf_bytes: bytes) -> List[Dict]:
    # Use pdfplumber to extract text (fallback) because vLLM doesn't natively process PDFs as images directly.
    # Alternatively, convert PDF pages to images (requires pdf2image and poppler). For simplicity, use text extraction.
    import pdfplumber
    from io import BytesIO
    text_pages = []
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_pages.append(t)
    full_text = "\n".join(text_pages)
    if not full_text.strip():
        return []
    messages = [
        {"role": "system", "content": "You extract financial transactions from bank statements (PDF text). Return JSON array of objects with fields: amount (float), date (YYYY-MM-DD), event_type (income/repayment/spend/balance), counterparty, description, confidence."},
        {"role": "user", "content": f"Extract transactions from this text:\n{full_text[:15000]}\n\nReturn JSON array."}
    ]
    resp_text = await call_vllm(messages, max_tokens=3000)
    return json.loads(resp_text)

async def generate_reasoning(signals_dict: dict, scores_dict: dict) -> dict:
    messages = [
        {"role": "system", "content": "You are a financial analyst. Given financial signals and computed scores, produce a JSON object with exactly five keys: income_reasoning (string), repayment_reasoning (string), confidence_reasoning (string), overall_reasoning (string), recommendation_text (string). Each value 2-4 sentences. No markdown."},
        {"role": "user", "content": f"Signals: {json.dumps(signals_dict)}\nScores: {json.dumps(scores_dict)}\nReturn JSON."}
    ]
    resp_text = await call_vllm(messages, max_tokens=800)
    return json.loads(resp_text)