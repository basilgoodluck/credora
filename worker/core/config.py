from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    redis_result_url: str = Field(default="redis://localhost:6379/1", alias="REDIS_RESULT_URL")

    # vLLM settings (replaces Anthropic and OCR)
    vllm_endpoint: str = Field(default="http://vllm:8001/v1", alias="VLLM_ENDPOINT")
    vllm_model: str = Field(default="Qwen/Qwen2.5-VL-7B-Instruct", alias="VLLM_MODEL")
    vllm_api_key: str = Field(default="token-abc123", alias="VLLM_API_KEY")

    # Storage
    max_download_bytes: int = 8 * 1024 * 1024
    storage_root: str = Field(default="storage/private", alias="STORAGE_ROOT")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

@lru_cache
def get_settings() -> Settings:
    return Settings()