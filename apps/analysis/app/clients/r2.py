import boto3
from botocore.client import Config

from app.core.config import settings


r2_client = boto3.client(
    "s3",
    endpoint_url=settings.R2_ENDPOINT,
    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4"),
)


def download_resume(object_key: str) -> bytes:
    response = r2_client.get_object(
        Bucket=settings.R2_BUCKET,
        Key=object_key,
    )

    return response["Body"].read()