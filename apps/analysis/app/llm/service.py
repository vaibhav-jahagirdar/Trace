from google.genai import types

from app.core.config import settings
from app.llm.client import client


async def generate(prompt: str) -> str:
    interaction = client.interactions.create(
        model=settings.GEMINI_MODEL,
        input=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
        ),
    )

    return interaction.output_text