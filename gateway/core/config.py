from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    redis_result_url: str = Field(default="redis://localhost:6379/1", alias="REDIS_RESULT_URL")
    jwt_secret: str = Field(alias="JWT_SECRET")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    storage_root: str = Field(default="storage/private", alias="STORAGE_ROOT")
    secure_cookies: bool = Field(default=False, alias="SECURE_COOKIES")
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    otp_expiry_minutes: int = 5
    otp_resend_seconds: int = 60
    max_upload_mb: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
