import os
from openai import OpenAI

from app.core.config import settings


class NIMClient:
    """
    NVIDIA NIM client with OpenAI-compatible interface.
    Provides a `complete` method identical to Azure ChatCompletionsClient.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            api_key = settings.NVIDIA_API_KEY or os.getenv("NVIDIA_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "NVIDIA_API_KEY is not configured. "
                    "Set it in your .env file or environment variables."
                )
            cls._instance._client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=api_key,
            )
        return cls._instance

    def complete(
        self,
        model: str,
        messages: list[dict],
        temperature: float = 1.0,
        top_p: float = 1.0,
        max_tokens: int = 16384,
        seed: int = 42,
        stream: bool = False,
        **kwargs
    ):
        """
        Drop-in replacement for Azure ChatCompletionsClient.complete.
        Forwards all parameters to OpenAI's chat.completions.create.
        """
        return self._client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            max_tokens=max_tokens,
            seed=seed,
            stream=stream,
            **kwargs
        )


# Expose a singleton instance (same pattern as your old file)
client = NIMClient()