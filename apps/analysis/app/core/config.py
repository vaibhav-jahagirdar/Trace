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
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "z-ai/glm-5.2")  # ✅ Added


settings = Settings()