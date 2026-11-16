import logging

from google.api_core.exceptions import GoogleAPICallError, GoogleAPIError
from google.auth.exceptions import GoogleAuthError
from google.cloud import vision

from app.providers.errors import ProviderError
from app.schemas import Label

MAX_LABELS = 20

logger = logging.getLogger(__name__)


class GoogleVisionProvider:
    """Label detection via Google Cloud Vision."""

    def __init__(self, credentials_path: str | None = None) -> None:
        self._credentials_path = credentials_path
        self._client: vision.ImageAnnotatorAsyncClient | None = None

    def _get_client(self) -> vision.ImageAnnotatorAsyncClient:
        # Created lazily so the gRPC channel binds to the running event loop.
        if self._client is None:
            if self._credentials_path:
                self._client = vision.ImageAnnotatorAsyncClient.from_service_account_file(
                    self._credentials_path
                )
            else:
                self._client = vision.ImageAnnotatorAsyncClient()
        return self._client

    async def label_image(self, image: bytes) -> list[Label]:
        request = vision.AnnotateImageRequest(
            image=vision.Image(content=image),
            features=[
                vision.Feature(type_=vision.Feature.Type.LABEL_DETECTION, max_results=MAX_LABELS)
            ],
        )
        try:
            batch = await self._get_client().batch_annotate_images(requests=[request])
        except (GoogleAPIError, GoogleAuthError) as exc:
            # Upstream errors can be long and include project details; keep them server-side.
            logger.warning("Cloud Vision request failed: %s", exc)
            code = exc.code if isinstance(exc, GoogleAPICallError) else None
            raise ProviderError(
                f"Cloud Vision request failed (HTTP {code})"
                if code
                else "Cloud Vision request failed"
            ) from exc

        response = batch.responses[0]
        if response.error.message:
            logger.warning("Cloud Vision error: %s", response.error.message)
            raise ProviderError("Cloud Vision could not analyse the image")
        return [Label(description=a.description, score=a.score) for a in response.label_annotations]

    async def aclose(self) -> None:
        if self._client is not None:
            await self._client.transport.close()  # type: ignore[no-untyped-call]
