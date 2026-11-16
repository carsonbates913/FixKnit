from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

ProviderKind = Literal["google", "fake"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    vision_provider: ProviderKind = "google"
    inspiration_provider: ProviderKind = "google"

    # Cloud Vision. When unset, the client falls back to Application Default Credentials.
    google_application_credentials: str | None = None

    # Custom Search JSON API.
    google_api_key: str = ""
    google_cse_id: str = ""

    cors_origins: list[str] = ["http://localhost:5173"]
    max_upload_bytes: int = 10 * 1024 * 1024
    max_image_dimension: int = 2048
