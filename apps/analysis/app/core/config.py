import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    R2_ENDPOINT = os.getenv("R2_ENDPOINT")
    R2_BUCKET = os.getenv("R2_BUCKET")
    R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")


settings = Settings()