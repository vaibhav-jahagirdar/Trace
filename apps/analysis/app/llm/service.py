from google.genai import types

from app.core.config import settings
from app.llm.client import client


async def generate(prompt: str) -> str:
    response = await client.aio.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
        ),
    )

    return response.text