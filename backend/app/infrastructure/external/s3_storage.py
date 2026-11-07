from __future__ import annotations

import asyncio

import boto3
from botocore.config import Config

from app.core.config import settings


class S3Storage:
    def __init__(self) -> None:
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version="s3v4"),
            use_ssl=settings.S3_USE_SSL,
        )
        self._bucket = settings.S3_BUCKET_NAME

    async def upload_file(self, file_path: str, key: str) -> str:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, self._client.upload_file, file_path, self._bucket, key)
        return f"{settings.S3_ENDPOINT}/{self._bucket}/{key}"

    async def delete_file(self, key: str) -> None:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, self._client.delete_object, Bucket=self._bucket, Key=key)

    async def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None, self._client.generate_presigned_url,
            "get_object", {"Bucket": self._bucket, "Key": key, "ExpiresIn": expires},
        )
