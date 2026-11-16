from app.config import Settings
from app.providers.storage.base import MediaStore


def build_media_store(settings: Settings) -> MediaStore:
    if settings.media_store == "memory":
        from app.providers.storage.memory import MemoryMediaStore

        return MemoryMediaStore()

    from app.providers.storage.supabase import SupabaseMediaStore

    return SupabaseMediaStore(
        settings.supabase_url, settings.supabase_secret_key, settings.media_bucket
    )


__all__ = ["MediaStore", "build_media_store"]
