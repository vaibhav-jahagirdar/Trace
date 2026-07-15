import asyncio
import json
from typing import Any

from app.core.config import settings
from app.llm.client import client
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_system_instruction,
)


async def generate(prompt: str) -> dict[str, Any]:
    # Load model from env, fallback to a strong NVIDIA NIM model
    model = settings.NVIDIA_MODEL or "meta/llama-3.3-70b-instruct"

    print("=" * 80)
    print("[LLM] Starting generation")
    print(f"[LLM] Model: {model}")
    print(f"[LLM] Prompt chars: {len(prompt)}")
    print("=" * 80)

    # Build system instruction
    system_instruction = build_resume_analysis_system_instruction()

    # NVIDIA NIM uses OpenAI-compatible messages (plain dicts)
    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": prompt},
    ]

    try:
        response = await asyncio.to_thread(
            client.complete,
            model=model,
            messages=messages,
            temperature=0,
            max_tokens=8000,
        )
    except Exception as exc:
        print("[LLM] Request failed")
        print(repr(exc))
        raise

    if not response.choices:
        raise RuntimeError(
            "Model returned no choices."
        )

    text = response.choices[0].message.content

    if isinstance(text, list):
        text = "".join(
            getattr(part, "text", str(part))
            for part in text
        )

    if not text:
        raise RuntimeError(
            "Model returned an empty response."
        )

    print("=" * 80)
    print("[LLM] Raw response preview")
    print(text[:3000])
    print("=" * 80)

    text = text.strip()

    # DeepSeek / GLM sometimes wrap JSON in markdown
    if text.startswith("```json"):
        text = text[len("```json") :].strip()

    elif text.startswith("```"):
        text = text[len("```") :].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    print("=" * 80)
    print("[LLM] Cleaned response preview")
    print(text[:3000])
    print("=" * 80)

    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        print("=" * 80)
        print("[LLM] JSON PARSE FAILED")
        print(text[:5000])
        print("=" * 80)

        raise RuntimeError(
            f"Model returned invalid JSON:\n{text[:2000]}"
        ) from exc

    if not isinstance(payload, dict):
        raise RuntimeError(
            f"Model returned JSON type {type(payload).__name__}, expected object."
        )

    print("=" * 80)
    print("[LLM] JSON parsed successfully")
    print(f"[LLM] Top-level keys: {list(payload.keys())}")
    print("=" * 80)

    return payload