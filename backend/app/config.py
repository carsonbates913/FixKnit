from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

ProviderKind = Literal["google", "fake"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    vision_provider: ProviderKind = "google"
    inspiration_provider: ProviderKind = "google"
    advisor_provider: Literal["claude", "fake"] = "fake"
    media_store: Literal["supabase", "memory"] = "supabase"

    # Cloud Vision. When unset, the client falls back to Application Default Credentials.
    google_application_credentials: str | None = None

    # Custom Search JSON API.
    google_api_key: str = ""
    google_cse_id: str = ""

    # Repair assistant (Claude). Point anthropic_base_url at a compatible gateway to use one, e.g.
    # https://chat.dartmouth.edu/api with advisor_model="anthropic.claude-sonnet-4-6".
    anthropic_api_key: str = ""
    anthropic_base_url: str | None = None
    advisor_model: str = "claude-sonnet-5-5"
    # Per-user caps that keep a public demo from running up the model bill.
    diagnoses_per_hour: int = 20
    chat_messages_per_hour: int = 60

    # Postgres (Supabase locally: `supabase start`).
    database_url: str = "postgresql+asyncpg://postgres:postgres@127.0.0.1:54322/postgres"

    # Supabase: auth tokens are verified against {supabase_url}/auth/v1/.well-known/jwks.json.
    supabase_url: str = "http://127.0.0.1:54321"
    supabase_secret_key: str = ""
    media_bucket: str = "media"
    # Base URL phones use to load photos, e.g. http://192.168.1.20:54321 on a LAN.
    # Defaults to supabase_url.
    media_public_url: str | None = None

    # Auth uses bearer tokens (never cookies), so any origin may call the API. This lets phones on
    # the LAN or a deployed web build reach it without per-host configuration.
    cors_origins: list[str] = ["*"]
    max_upload_bytes: int = 10 * 1024 * 1024
    max_image_dimension: int = 2048
