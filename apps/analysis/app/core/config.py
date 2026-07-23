import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    R2_ENDPOINT = os.getenv("R2_ENDPOINT")
    R2_BUCKET = os.getenv("R2_BUCKET")
    R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    GEMINI_TIMEOUT = int(os.getenv("GEMINI_TIMEOUT", "30"))
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    GITHUB_MODEL = os.getenv("GITHUB_MODEL", "deepseek/DeepSeek-R1-0528")
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-super-120b-a12b")  # ✅ Added
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME", "gpt-5-mini")

settings = Settings()