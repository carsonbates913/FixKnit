.PHONY: install dev api web test lint format gen-client check-client

install:  ## Install backend and frontend dependencies
	cd backend && uv sync
	cd frontend && npm ci

dev:  ## Run API and web dev servers together
	$(MAKE) -j2 api web

api:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

web:
	cd frontend && npm run dev

test:  ## Backend test suite
	cd backend && uv run pytest

lint:  ## All linters and type checkers
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy app
	cd frontend && npm run lint && npm run typecheck

format:
	cd backend && uv run ruff format . && uv run ruff check --fix .

gen-client:  ## Regenerate frontend API types from the backend's OpenAPI spec
	cd backend && uv run python -m scripts.export_openapi > ../frontend/openapi.json
	cd frontend && npm run gen:api

check-client: gen-client  ## Fail if generated API types are out of date
	git diff --exit-code -- frontend/openapi.json frontend/src/api/schema.ts
