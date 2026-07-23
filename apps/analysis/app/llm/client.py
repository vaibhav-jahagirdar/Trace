import os
from openai import OpenAI

from app.core.config import settings


class MultiProviderClient:
    """
    Unified client supporting NVIDIA NIM and Azure OpenAI.
    Uses the same `complete` method interface.
    """
    _nvidia_instance = None
    _azure_instance = None

    @classmethod
    def _get_nvidia_client(cls) -> OpenAI:
        """Get or create NVIDIA NIM client."""
        if cls._nvidia_instance is None:
            api_key = settings.NVIDIA_API_KEY or os.getenv("NVIDIA_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "NVIDIA_API_KEY is not configured. "
                    "Set it in your .env file or environment variables."
                )
            cls._nvidia_instance = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=api_key,
            )
        return cls._nvidia_instance

    @classmethod
    def _get_azure_client(cls) -> OpenAI:
        """Get or create Azure OpenAI client."""
        if cls._azure_instance is None:
            endpoint = settings.AZURE_OPENAI_ENDPOINT or os.getenv("AZURE_OPENAI_ENDPOINT")
            api_key = settings.AZURE_OPENAI_API_KEY or os.getenv("AZURE_OPENAI_API_KEY")
            
            if not endpoint or not api_key:
                raise RuntimeError(
                    "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be configured. "
                    "Set them in your .env file or environment variables."
                )
            
            # Ensure endpoint doesn't have trailing /openai/v1
            base_url = endpoint.rstrip("/")
            if not base_url.endswith("/openai/v1"):
                base_url = f"{base_url}/openai/v1"
            
            cls._azure_instance = OpenAI(
                base_url=base_url,
                api_key=api_key,
            )
        return cls._azure_instance

    def complete(
        self,
        model: str,
        messages: list[dict],
        temperature: float = 1.0,
        top_p: float = 1.0,
        max_tokens: int = 16384,
        max_completion_tokens: int = None,  # 👈 NEW: Azure uses this
        seed: int = 42,
        stream: bool = False,
        provider: str = "nvidia",  # "nvidia" or "azure"
        **kwargs
    ):
        """
        Unified completion method for both providers.
        
        Args:
            provider: "nvidia" (default) or "azure"
            model: Model name (NVIDIA NIM model or Azure deployment name)
            messages: List of message dicts
            temperature: Sampling temperature
            top_p: Nucleus sampling parameter
            max_tokens: Maximum tokens to generate (NVIDIA NIM)
            max_completion_tokens: Maximum tokens for Azure (overrides max_tokens)
            seed: Random seed for reproducibility
            stream: Whether to stream the response
            **kwargs: Additional arguments passed to the underlying client
        """
        if provider == "azure":
            client = self._get_azure_client()
            # Azure uses max_completion_tokens
            token_param = max_completion_tokens if max_completion_tokens is not None else max_tokens
            return client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_completion_tokens=token_param,  # 👈 Azure uses this
                seed=seed,
                stream=stream,
                **kwargs
            )
        else:  # default to nvidia
            client = self._get_nvidia_client()
            return client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,  # 👈 NVIDIA uses max_tokens
                seed=seed,
                stream=stream,
                **kwargs
            )


# Expose a singleton instance
client = MultiProviderClient()