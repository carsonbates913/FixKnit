from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute

from app.api.routes import analysis, guides, health, inspiration
from app.config import Settings
from app.providers.errors import ProviderError
from app.providers.inspiration import build_inspiration_provider
from app.providers.vision import build_vision_provider


def _operation_id(route: APIRoute) -> str:
    return route.name


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.vision = build_vision_provider(settings)
        app.state.inspiration = build_inspiration_provider(settings)
        yield
        await app.state.vision.aclose()
        await app.state.inspiration.aclose()

    app = FastAPI(title="FixKnit API", lifespan=lifespan, generate_unique_id_function=_operation_id)
    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ProviderError)
    async def provider_error_handler(_: Request, exc: ProviderError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_502_BAD_GATEWAY, content={"detail": str(exc)})

    for module in (health, analysis, inspiration, guides):
        app.include_router(module.router, prefix="/api")

    return app


app = create_app()
