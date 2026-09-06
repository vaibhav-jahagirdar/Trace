import os

from openai import OpenAI

from app.core.config import settings


class MultiProviderClient:
    """
    Unified client supporting DeepSeek and Azure OpenAI.
    """

    _azure_instance = None
    _deepseek_instance = None

    @classmethod
    def _get_azure_client(cls) -> OpenAI:
        """Get or create Azure OpenAI client."""
        if cls._azure_instance is None:
            endpoint = (
                settings.AZURE_OPENAI_ENDPOINT
                or os.getenv("AZURE_OPENAI_ENDPOINT")
            )

            api_key = (
                settings.AZURE_OPENAI_API_KEY
                or os.getenv("AZURE_OPENAI_API_KEY")
            )

            if not endpoint or not api_key:
                raise RuntimeError(
                    "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be configured. "
                    "Set them in your .env file or environment variables."
                )

            # Accept endpoints copied from Azure portal/env files, including
            # an accidental duplicated `h` and a Responses route suffix.
            base_url = endpoint.strip().replace("hhttps://", "https://", 1).rstrip("/")
            if "/openai/v1/responses" in base_url:
                base_url = base_url.replace("/openai/v1/responses", "/openai/v1")
            elif base_url.endswith("/responses"):
                base_url = base_url[: -len("/responses")]

            if not base_url.endswith("/openai/v1"):
                base_url = f"{base_url}/openai/v1"

            cls._azure_instance = OpenAI(
                base_url=base_url,
                api_key=api_key,
            )

        return cls._azure_instance

    @classmethod
    def _get_deepseek_client(cls) -> OpenAI:
        """Get or create DeepSeek client."""
        if cls._deepseek_instance is None:
            api_key = (
                settings.DEEPSEEK_API_KEY
                or os.getenv("DEEPSEEK_API_KEY")
            )

            if not api_key:
                raise RuntimeError(
                    "DEEPSEEK_API_KEY is not configured. "
                    "Set it in your .env file or environment variables."
                )

            base_url = (
                settings.DEEPSEEK_BASE_URL
                or os.getenv(
                    "DEEPSEEK_BASE_URL",
                    "https://api.deepseek.com",
                )
            )

            cls._deepseek_instance = OpenAI(
                base_url=base_url,
                api_key=api_key,
            )

        return cls._deepseek_instance

    def complete(
        self,
        model: str,
        messages: list[dict],
        temperature: float = 1.0,
        top_p: float = 1.0,
        max_tokens: int = 65536,
        max_completion_tokens: int | None = None,
        seed: int = 42,
        stream: bool = False,
        provider: str = "azure",
        reasoning_effort: str = "high",
        json_output: bool = True,
        **kwargs,
    ):
        """
        Unified completion method.

        provider:
            - "deepseek"
            - "azure"

        DeepSeek:
            - thinking enabled
            - reasoning effort = max
            - JSON output enabled
            - sampling parameters are not sent
        """

        if provider == "deepseek":
            client = self._get_deepseek_client()

            request_kwargs = {
                "model": model,
                "messages": messages,
                "reasoning_effort": reasoning_effort,
                "max_tokens": max_tokens,
                "stream": stream,
                "extra_body": {
                    "thinking": {
                        "type": "enabled",
                    },
                },
                **kwargs,
            }

            if json_output:
                request_kwargs["response_format"] = {
                    "type": "json_object",
                }

            return client.chat.completions.create(
                **request_kwargs
            )

        if provider == "azure":
            client = self._get_azure_client()

            token_param = (
                max_completion_tokens
                if max_completion_tokens is not None
                else max_tokens
            )

            request_kwargs = {
                "model": model,
                "messages": messages,
                "max_completion_tokens": token_param,
                "stream": stream,
                "reasoning_effort": reasoning_effort,
                **kwargs,
            }
            # GPT-5/o-series reasoning deployments reject sampling controls.
            if not (model.lower().startswith("gpt-5") or model.lower().startswith("o1") or model.lower().startswith("o3")):
                request_kwargs.update({"temperature": temperature, "top_p": top_p, "seed": seed})
            if json_output:
                request_kwargs["response_format"] = {"type": "json_object"}
            return client.chat.completions.create(**request_kwargs)

        raise ValueError(
            f"Unsupported provider: {provider}. "
            "Use 'deepseek' or 'azure'."
        )


client = MultiProviderClient()
