import json
from typing import Any

from google.genai import types

from app.core.config import settings
from app.llm.client import client
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_system_instruction,
)
from app.schemas.resume_report import ResumeAnalysisLLMResponse


async def generate(prompt: str) -> dict[str, Any]:
    response = await client.aio.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=build_resume_analysis_system_instruction(),
            response_mime_type="application/json",
            response_json_schema=ResumeAnalysisLLMResponse.model_json_schema(),
            thinking_config=types.ThinkingConfig(
                thinking_level="high",
            ),
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    try:
        payload = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini returned invalid JSON.") from exc

    if not isinstance(payload, dict):
        raise RuntimeError("Gemini returned JSON that was not an object.")

    return payload
