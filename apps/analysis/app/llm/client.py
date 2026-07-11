
from google import genai

from app.core.config import settings


class GeminiClient:
    

    _client: genai.Client | None = None

    @classmethod
    def get_client(cls) -> genai.Client:
        if cls._client is None:
            if not settings.GEMINI_API_KEY:
                raise RuntimeError(
                    "GEMINI_API_KEY is not configured."
                )

            cls._client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
            )

        return cls._client


client = GeminiClient.get_client()