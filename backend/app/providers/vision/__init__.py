from app.config import Settings
from app.providers.vision.base import VisionProvider


def build_vision_provider(settings: Settings) -> VisionProvider:
    if settings.vision_provider == "fake":
        from app.providers.vision.fake import FakeVisionProvider

        return FakeVisionProvider()

    from app.providers.vision.google_vision import GoogleVisionProvider

    return GoogleVisionProvider(credentials_path=settings.google_application_credentials)


__all__ = ["VisionProvider", "build_vision_provider"]
