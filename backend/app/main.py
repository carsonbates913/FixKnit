from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.routes import (
    analysis,
    diagnoses,
    guides,
    health,
    inspiration,
    me,
    media,
    posts,
    profiles,
    projects,
)
from app.auth import TokenVerifier
from app.config import Settings
from app.db import make_engine
from app.providers.advisor import build_repair_advisor
from app.providers.errors import ProviderError
from app.providers.inspiration import build_inspiration_provider
from app.providers.storage import build_media_store
from app.providers.vision import build_vision_provider


def _operation_id(route: APIRoute) -> str:
    return route.name


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = make_engine(settings.database_url)
        app.state.sessionmaker = async_sessionmaker(engine, expire_on_commit=False)
        app.state.token_verifier = TokenVerifier(settings.supabase_url)
        app.state.vision = build_vision_provider(settings)
        app.state.inspiration = build_inspiration_provider(settings)
        app.state.media_store = build_media_store(settings)
        app.state.advisor = build_repair_advisor(settings)
        yield
        for provider in ("vision", "inspiration", "media_store", "advisor"):
            await getattr(app.state, provider).aclose()
        await engine.dispose()

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

    for module in (
        health,
        analysis,
        inspiration,
        guides,
        me,
        profiles,
        media,
        diagnoses,
        projects,
        posts,
    ):
        app.include_router(module.router, prefix="/api")

    return app


app = create_app()
