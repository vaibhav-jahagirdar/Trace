import asyncio
import json
from typing import Any

from app.core.config import settings
from app.llm.client import client
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_system_instruction,
)


async def generate(prompt: str) -> dict[str, Any]:
    # Load model from env
    model = settings.NVIDIA_MODEL or "meta/llama-3.3-70b-instruct"

    print("=" * 80)
    print("[LLM] Starting generation")
    print(f"[LLM] Model: {model}")
    print(f"[LLM] Prompt chars: {len(prompt)}")
    print("=" * 80)

    # Build system instruction
    system_instruction = build_resume_analysis_system_instruction()

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": prompt},
    ]

    try:
        response = await asyncio.to_thread(
            client.complete,
            model=model,
            messages=messages,
            temperature=0.1,      # 👈 Low temp = deterministic JSON, but not 0 (allows slight variation for edge cases)
            top_p=0.95,           # 👈 FIXED: Missing comma added here
            max_tokens=19834,      # 👈 BALANCED: 8k tokens is 2x your expected JSON size (safe, but not wasteful like 10k)
            seed=42,
            response_format={"type": "json_object"},
        )
    except Exception as exc:
        print("[LLM] Request failed")
        print(repr(exc))
        raise

    if not response.choices:
        raise RuntimeError("Model returned no choices.")

    text = response.choices[0].message.content

    if isinstance(text, list):
        text = "".join(getattr(part, "text", str(part)) for part in text)

    if not text:
        raise RuntimeError("Model returned an empty response.")

    print("=" * 80)
    print("[LLM] Raw response preview")
    print(text[:3000])
    print("=" * 80)

    text = text.strip()

    # DeepSeek respects response_format, but keep these for safety
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
        raise RuntimeError(f"Model returned invalid JSON:\n{text[:2000]}") from exc

    if not isinstance(payload, dict):
        raise RuntimeError(
            f"Model returned JSON type {type(payload).__name__}, expected object."
        )

    print("=" * 80)
    print("[LLM] JSON parsed successfully")
    print(f"[LLM] Top-level keys: {list(payload.keys())}")
    print("=" * 80)

    return payload