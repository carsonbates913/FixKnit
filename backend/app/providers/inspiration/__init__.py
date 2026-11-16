from app.config import Settings
from app.providers.inspiration.base import InspirationProvider


def build_inspiration_provider(settings: Settings) -> InspirationProvider:
    if settings.inspiration_provider == "fake":
        from app.providers.inspiration.fake import FakeInspirationProvider

        return FakeInspirationProvider()

    from app.providers.inspiration.google_cse import GoogleCustomSearchProvider

    return GoogleCustomSearchProvider(
        api_key=settings.google_api_key, cse_id=settings.google_cse_id
    )


__all__ = ["InspirationProvider", "build_inspiration_provider"]
