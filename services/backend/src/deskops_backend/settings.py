from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "deskops-backend"
    app_env: str = "local"
    app_port: int = 4310
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/deskops"
    use_in_memory_repositories: bool = True
    enable_outbox_daemon: bool = False
    outbox_poll_interval_seconds: int = 5
    outbox_poll_limit: int = 100
    outbox_max_attempts: int = 3
    db_startup_check_enabled: bool = True
    db_startup_fail_fast: bool = True
    ai_provider: str = "bedrock_nova"
    ai_model_id: str = "amazon.nova-lite-v1:0"
    ai_region: str = "us-east-1"
    aws_access_key_id: str | None = Field(default=None)
    aws_secret_access_key: str | None = Field(default=None)
    aws_session_token: str | None = Field(default=None)
    aws_profile: str | None = Field(default=None)
    aws_default_region: str | None = Field(default=None)
    ai_metadata_only: bool = True
    ai_max_tokens: int = 900
    ai_temperature: float = 0.2
    ai_timeout_seconds: int = 20
    ai_startup_fail_fast: bool = False


settings = Settings()
