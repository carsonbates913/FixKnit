"""Supabase Auth: verify access tokens against the project's JWKS and load the caller's profile."""

import uuid
from dataclasses import dataclass
from functools import cached_property
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db import SessionDep
from app.models import Profile

AUDIENCE = "authenticated"


@dataclass(frozen=True)
class AuthUser:
    id: uuid.UUID
    is_guest: bool


class TokenVerifier:
    def __init__(self, supabase_url: str) -> None:
        self.issuer = f"{supabase_url.rstrip('/')}/auth/v1"

    @cached_property
    def _jwks(self) -> jwt.PyJWKClient:
        return jwt.PyJWKClient(
            f"{self.issuer}/.well-known/jwks.json", cache_keys=True, lifespan=3600
        )

    def verify(self, token: str) -> AuthUser:
        try:
            key = self._jwks.get_signing_key_from_jwt(token)
            claims: dict[str, Any] = jwt.decode(
                token, key.key, algorithms=["ES256", "RS256"], audience=AUDIENCE, issuer=self.issuer
            )
            return AuthUser(id=uuid.UUID(claims["sub"]), is_guest=bool(claims.get("is_anonymous")))
        except (jwt.PyJWTError, KeyError, ValueError) as exc:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session") from exc


_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]
) -> AuthUser:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in to continue")
    verifier: TokenVerifier = request.app.state.token_verifier
    return verifier.verify(credentials.credentials)


def get_optional_user(
    request: Request, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]
) -> AuthUser | None:
    return get_current_user(request, credentials) if credentials else None


CurrentUser = Annotated[AuthUser, Depends(get_current_user)]
OptionalUser = Annotated[AuthUser | None, Depends(get_optional_user)]


async def get_current_profile(user: CurrentUser, session: SessionDep) -> Profile:
    profile = await session.get(Profile, user.id)
    if profile is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Choose a handle before posting")
    return profile


CurrentProfile = Annotated[Profile, Depends(get_current_profile)]
