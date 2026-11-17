from app.config import Settings
from app.providers.storage import build_media_store


def test_public_url_defaults_to_supabase_url() -> None:
    store = build_media_store(Settings(_env_file=None, supabase_url="http://127.0.0.1:54321"))
    assert (
        store.public_url("u/p.jpg")
        == "http://127.0.0.1:54321/storage/v1/object/public/media/u/p.jpg"
    )


def test_public_url_override_for_phones_and_tunnels() -> None:
    store = build_media_store(
        Settings(
            _env_file=None,
            supabase_url="http://127.0.0.1:54321",
            media_public_url="https://cdn.test/",
        )
    )
    assert store.public_url("u/p.jpg") == "https://cdn.test/storage/v1/object/public/media/u/p.jpg"


def test_database_url_accepts_supabase_format() -> None:
    from app.config import Settings

    s = Settings(_env_file=None, database_url="postgresql://u:p@host:5432/postgres")
    assert s.database_url == "postgresql+asyncpg://u:p@host:5432/postgres"
