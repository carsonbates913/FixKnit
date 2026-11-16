import time
import uuid
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException

from app.auth import TokenVerifier

ISSUER_BASE = "http://supabase.test"


class FakeJWKS:
    def __init__(self, public_key: Any) -> None:
        self.public_key = public_key

    def get_signing_key_from_jwt(self, token: str) -> Any:
        return type("Key", (), {"key": self.public_key})()


@pytest.fixture
def keys() -> tuple[Any, TokenVerifier]:
    private = ec.generate_private_key(ec.SECP256R1())
    verifier = TokenVerifier(ISSUER_BASE)
    verifier.__dict__["_jwks"] = FakeJWKS(private.public_key())
    return private, verifier


def token(private: Any, **overrides: Any) -> str:
    claims = {
        "sub": str(uuid.uuid4()),
        "aud": "authenticated",
        "iss": f"{ISSUER_BASE}/auth/v1",
        "exp": int(time.time()) + 300,
        "is_anonymous": True,
        **overrides,
    }
    return jwt.encode(claims, private, algorithm="ES256")


def test_valid_guest_token(keys: tuple[Any, TokenVerifier]) -> None:
    private, verifier = keys
    user_id = uuid.uuid4()
    user = verifier.verify(token(private, sub=str(user_id)))
    assert user.id == user_id
    assert user.is_guest


@pytest.mark.parametrize(
    "overrides",
    [
        {"exp": int(time.time()) - 10},
        {"aud": "anon"},
        {"iss": "http://evil.test/auth/v1"},
        {"sub": "not-a-uuid"},
    ],
)
def test_rejects_bad_tokens(keys: tuple[Any, TokenVerifier], overrides: dict[str, Any]) -> None:
    private, verifier = keys
    with pytest.raises(HTTPException) as info:
        verifier.verify(token(private, **overrides))
    assert info.value.status_code == 401


def test_rejects_token_signed_by_another_key(keys: tuple[Any, TokenVerifier]) -> None:
    _, verifier = keys
    other = ec.generate_private_key(ec.SECP256R1())
    with pytest.raises(HTTPException):
        verifier.verify(token(other))
