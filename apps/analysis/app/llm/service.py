import asyncio
import json
import os
import tempfile
import re
import random
from typing import Any, Tuple

from app.core.config import settings
from app.llm.client import client
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_system_instruction,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

NVIDIA_MODEL = settings.NVIDIA_MODEL or "deepseek-ai/deepseek-v4-flash"


def extract_json_from_response(text: str) -> str:
    """
    Extracts the first valid JSON object or array from a string.
    Removes any preamble (like "We", "I think", markdown fences).
    """
    text = text.strip()
    if text.startswith("```json"):
        text = text[len("```json") :].strip()
    elif text.startswith("```"):
        text = text[len("```") :].strip()
    if text.endswith("```"):
        text = text[:-3].strip()

    match = re.search(r"[\[\{].*", text, re.DOTALL)
    if not match:
        return text
    return match.group(0)


async def _call_with_retry(
    func,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 16.0,
    jitter: bool = True,
) -> Any:
    """
    Call an async function with exponential backoff retry.
    Retries on rate‑limit, server errors, and connection errors.
    """
    for attempt in range(max_retries + 1):
        try:
            return await func()
        except Exception as e:
            should_retry = False
            if hasattr(e, "status_code") and e.status_code in (429, 503, 500):
                should_retry = True
            elif "ResourceExhausted" in str(e) or "rate limit" in str(e).lower():
                should_retry = True
            elif "Connection error" in str(e) or "timeout" in str(e).lower():
                should_retry = True

            if not should_retry or attempt == max_retries:
                raise

            delay = min(base_delay * (2 ** attempt), max_delay)
            if jitter:
                delay *= random.uniform(0.8, 1.2)
            print(f"[LLM] Retry {attempt+1}/{max_retries} after {delay:.2f}s due to: {e}")
            await asyncio.sleep(delay)


# ---------------------------------------------------------------------------
# Main Generate Function (NVIDIA NIM)
# ---------------------------------------------------------------------------

async def generate(prompt: str) -> Tuple[dict[str, Any] | None, str]:
    """
    Generate structured JSON using NVIDIA NIM (DeepSeek V4 Flash).
    Thinking mode is disabled for faster, deterministic JSON extraction.

    Returns:
        Tuple[dict | None, str]: (parsed JSON payload, raw response text)
        If JSON parsing fails, payload is None but raw_text is still returned.
    """
    # Build system instruction
    system_instruction = build_resume_analysis_system_instruction()

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": prompt},
    ]

    raw_text = None

    # Debug: write prompt to temp file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
        tmp.write("=== SYSTEM INSTRUCTION ===\n")
        tmp.write(system_instruction)
        tmp.write("\n\n=== USER PROMPT ===\n")
        tmp.write(prompt)
        tmp_path = tmp.name
    print(f"[LLM] Debug files (prompt) written to: {tmp_path}")

    print("=" * 80)
    print("[LLM] Calling NVIDIA NIM (DeepSeek V4 Flash)")
    print(f"[LLM] Model: {NVIDIA_MODEL}")
    print(f"[LLM] Prompt chars: {len(prompt)}")
    print("=" * 80)

    try:
        # ── Correct parameters per NVIDIA NIM ──
        # - extra_body={"chat_template_kwargs": {"thinking": False}} disables thinking mode.
        # - temperature, top_p, seed work as expected when thinking is disabled.
        # - NVIDIA does NOT support response_format; we rely on prompt + extraction.
        async def call_nvidia():
            return await asyncio.to_thread(
                client.complete,
                provider="nvidia",
                model=NVIDIA_MODEL,
                messages=messages,
                temperature=0,           # Deterministic output
                top_p=0.95,              # Default from NVIDIA docs
                max_tokens=24576,        # Safe ceiling for large JSON
                seed=42,                 # Reproducibility
                extra_body={"chat_template_kwargs": {"thinking": False}},  # ✅ Disable thinking
            )

        response = await _call_with_retry(call_nvidia, max_retries=3, base_delay=2.0, max_delay=16.0, jitter=True)

        if not response.choices:
            raise RuntimeError("NVIDIA NIM returned no choices.")

        raw_text = response.choices[0].message.content
        if isinstance(raw_text, list):
            raw_text = "".join(getattr(part, "text", str(part)) for part in raw_text)

        if not raw_text:
            raise RuntimeError("NVIDIA NIM returned an empty response.")

        print("=" * 80)
        print("[LLM] NVIDIA NIM response received")
        print("=" * 80)

    except Exception as nvidia_error:
        print("[LLM] NVIDIA NIM failed")
        print(f"[LLM] NVIDIA error: {repr(nvidia_error)}")
        raise RuntimeError("NVIDIA NIM provider failed.") from nvidia_error

    # ── Save raw response to a temp file (ALWAYS) ──
    with tempfile.NamedTemporaryFile(mode="w", suffix="_raw.txt", delete=False) as f:
        f.write(raw_text)
        raw_response_path = f.name
    print(f"[LLM] Raw response written to: {raw_response_path}")

    # ── Clean and parse JSON ──
    print("=" * 80)
    print("[LLM] Raw response preview")
    print(raw_text[:3000])
    print("=" * 80)

    cleaned_text = extract_json_from_response(raw_text)

    print("=" * 80)
    print("[LLM] Cleaned response preview")
    print(cleaned_text[:3000])
    print("=" * 80)

    payload = None
    try:
        payload = json.loads(cleaned_text)
        print("[LLM] JSON parsed successfully")
        print(f"[LLM] Top-level keys: {list(payload.keys())}")
    except json.JSONDecodeError:
        print("[LLM] JSON PARSE FAILED – raw response saved to", raw_response_path)
        # Do not raise – we return payload=None and raw_text

    return payload, raw_text