from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    redis_result_url: str = Field(default="redis://localhost:6379/1", alias="REDIS_RESULT_URL")
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    hf_enable: bool = Field(default=True, alias="HF_ENABLE")
    hf_model: str = Field(default="google/flan-t5-small", alias="HF_MODEL")
    hf_device: str = Field(default="auto", alias="HF_DEVICE")
    max_download_bytes: int = 8 * 1024 * 1024
    storage_root: str = Field(default="storage/private", alias="STORAGE_ROOT")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
