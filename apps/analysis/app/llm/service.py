import asyncio
import json
import os
import random
import re
import tempfile
from typing import Any, Tuple

from app.core.config import settings
from app.llm.client import client
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_system_instruction,
)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEEPSEEK_MODEL = (
    settings.DEEPSEEK_MODEL
    or os.getenv("DEEPSEEK_MODEL")
    or "deepseek-v4-flash"
)

# Application-level concurrency.
#
# DeepSeek's account-level V4 Flash concurrency limit is much higher,
# but your own service should still control how many requests it launches.
#
# Example:
#   DEEPSEEK_MAX_CONCURRENCY=10
#
DEEPSEEK_MAX_CONCURRENCY = int(
    settings.DEEPSEEK_MAX_CONCURRENCY
    or os.getenv("DEEPSEEK_MAX_CONCURRENCY", "10")
)

# One shared semaphore for the Python process.
_DEEPSEEK_SEMAPHORE = asyncio.Semaphore(DEEPSEEK_MAX_CONCURRENCY)


# ---------------------------------------------------------------------------
# JSON Extraction
# ---------------------------------------------------------------------------

def extract_json_from_response(text: str) -> str:
    """
    Extract the first JSON object or array from a model response.

    DeepSeek JSON mode should normally return clean JSON, but this keeps
    the existing defensive parsing behavior.
    """
    text = text.strip()

    if text.startswith("```json"):
        text = text[len("```json"):].strip()
    elif text.startswith("```"):
        text = text[len("```"):].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    match = re.search(r"[\[\{].*", text, re.DOTALL)

    if not match:
        return text

    return match.group(0)


# ---------------------------------------------------------------------------
# Retry
# ---------------------------------------------------------------------------

async def _call_with_retry(
    func,
    max_retries: int = 3,
    base_delay: float = 2.0,
    max_delay: float = 16.0,
    jitter: bool = True,
) -> Any:
    """
    Call an async function with exponential backoff.

    Retries:
      - 429 rate limit
      - 500/503 server errors
      - connection errors
      - timeout errors
    """

    for attempt in range(max_retries + 1):
        try:
            return await func()

        except Exception as e:
            should_retry = False

            status_code = getattr(e, "status_code", None)

            if status_code in (429, 500, 503):
                should_retry = True

            error_text = str(e).lower()

            if "rate limit" in error_text:
                should_retry = True

            if "connection error" in error_text:
                should_retry = True

            if "timeout" in error_text:
                should_retry = True

            if not should_retry or attempt == max_retries:
                raise

            delay = min(
                base_delay * (2 ** attempt),
                max_delay,
            )

            if jitter:
                delay *= random.uniform(0.8, 1.2)

            print(
                f"[LLM] Retry {attempt + 1}/{max_retries} "
                f"after {delay:.2f}s due to: {e}"
            )

            await asyncio.sleep(delay)


# ---------------------------------------------------------------------------
# Main Generate Function
# ---------------------------------------------------------------------------

async def generate(prompt: str) -> Tuple[dict[str, Any] | None, str]:
    """
    Generate structured JSON using DeepSeek V4 Flash.

    Configuration:
      - DeepSeek V4 Flash
      - Thinking mode enabled
      - reasoning_effort = max
      - JSON output enabled
      - max_tokens = 16384
      - application-level concurrency control

    Returns:
        (parsed JSON payload, raw response text)

    If JSON parsing fails:
        payload = None
        raw_text = still returned
    """

    # -----------------------------------------------------------------------
    # Build system instruction
    # -----------------------------------------------------------------------

    system_instruction = build_resume_analysis_system_instruction()

    messages = [
        {
            "role": "system",
            "content": system_instruction,
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]

    raw_text: str | None = None

    # -----------------------------------------------------------------------
    # Debug prompt file
    # -----------------------------------------------------------------------

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".txt",
        delete=False,
        encoding="utf-8",
    ) as tmp:
        tmp.write("=== SYSTEM INSTRUCTION ===\n")
        tmp.write(system_instruction)

        tmp.write("\n\n=== USER PROMPT ===\n")
        tmp.write(prompt)

        tmp_path = tmp.name

    print(f"[LLM] Debug prompt written to: {tmp_path}")

    print("=" * 80)
    print("[LLM] Calling DeepSeek")
    print(f"[LLM] Model: {DEEPSEEK_MODEL}")
    print("[LLM] Thinking: enabled")
    print("[LLM] Reasoning effort: max")
    print("[LLM] JSON output: enabled")
    print(f"[LLM] Max concurrency: {DEEPSEEK_MAX_CONCURRENCY}")
    print(f"[LLM] Prompt chars: {len(prompt)}")
    print("=" * 80)

    # -----------------------------------------------------------------------
    # DeepSeek request
    # -----------------------------------------------------------------------

    async def call_deepseek():
        return await asyncio.to_thread(
            client.complete,
            provider="deepseek",
            model=DEEPSEEK_MODEL,
            messages=messages,

            # DeepSeek thinking configuration
            reasoning_effort="max",

            # JSON mode
            json_output=True,

            # Large enough for your evaluation object
           max_tokens=65_536,

            # Do NOT send temperature/top_p/seed.
            # DeepSeek thinking mode does not use them.
        )

    try:
        # Application-level concurrency protection.
        async with _DEEPSEEK_SEMAPHORE:

            print(
                "[LLM] Acquired DeepSeek concurrency slot "
                f"({DEEPSEEK_MAX_CONCURRENCY} max)"
            )

            response = await _call_with_retry(
                call_deepseek,
                max_retries=3,
                base_delay=2.0,
                max_delay=16.0,
                jitter=True,
            )

        if not response.choices:
            raise RuntimeError(
                "DeepSeek returned no choices."
            )

        message = response.choices[0].message

        raw_text = message.content

        # DeepSeek exposes reasoning separately.
        #
        # DO NOT persist reasoning_content as part of your evaluation.
        #
        # We only need the final model content.
        if isinstance(raw_text, list):
            raw_text = "".join(
                getattr(part, "text", str(part))
                for part in raw_text
            )

        if not raw_text:
            raise RuntimeError(
                "DeepSeek returned an empty response."
            )

        # -------------------------------------------------------------------
        # Usage / cache observability
        # -------------------------------------------------------------------

        usage = getattr(response, "usage", None)

        if usage:
            cache_hit_tokens = getattr(
                usage,
                "prompt_cache_hit_tokens",
                0,
            )

            cache_miss_tokens = getattr(
                usage,
                "prompt_cache_miss_tokens",
                0,
            )

            print(
                "[LLM] Token usage:"
                f" cache_hit={cache_hit_tokens},"
                f" cache_miss={cache_miss_tokens}"
            )

        print("=" * 80)
        print("[LLM] DeepSeek response received")
        print("=" * 80)

    except Exception as deepseek_error:
        print("[LLM] DeepSeek failed")
        print(f"[LLM] DeepSeek error: {repr(deepseek_error)}")

        raise RuntimeError(
            "DeepSeek provider failed."
        ) from deepseek_error

    # -----------------------------------------------------------------------
    # Save raw response
    # -----------------------------------------------------------------------

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix="_raw.txt",
        delete=False,
        encoding="utf-8",
    ) as f:
        f.write(raw_text)

        raw_response_path = f.name

    print(
        f"[LLM] Raw response written to: "
        f"{raw_response_path}"
    )

    # -----------------------------------------------------------------------
    # Debug raw response
    # -----------------------------------------------------------------------

    print("=" * 80)
    print("[LLM] Raw response preview")
    print(raw_text[:3000])
    print("=" * 80)

    # -----------------------------------------------------------------------
    # Clean JSON
    # -----------------------------------------------------------------------

    cleaned_text = extract_json_from_response(
        raw_text
    )

    print("=" * 80)
    print("[LLM] Cleaned response preview")
    print(cleaned_text[:3000])
    print("=" * 80)

    # -----------------------------------------------------------------------
    # Parse JSON
    # -----------------------------------------------------------------------

    payload: dict[str, Any] | None = None

    try:
        payload = json.loads(cleaned_text)

        if not isinstance(payload, dict):
            raise ValueError(
                "DeepSeek JSON response is not a JSON object."
            )

        print("[LLM] JSON parsed successfully")
        print(
            f"[LLM] Top-level keys: "
            f"{list(payload.keys())}"
        )

    except (json.JSONDecodeError, ValueError):
        print(
            "[LLM] JSON PARSE FAILED – "
            f"raw response saved to {raw_response_path}"
        )

    return payload, raw_text
