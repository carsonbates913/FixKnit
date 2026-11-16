.PHONY: install dev api web mobile db test lint format gen-client check-client

install:  ## Install backend and frontend dependencies
	cd backend && uv sync
	cd frontend && npm ci
	cd apps/mobile && npm ci

dev:  ## Run API and web dev servers together
	$(MAKE) -j2 api web

db:  ## Start local Supabase (Postgres, Auth, Storage) and apply migrations
	npx --yes supabase start
	cd backend && uv run alembic upgrade head

api:  ## Listens on all interfaces so phones on the same wifi can reach it
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

mobile:  ## Expo dev server: scan the QR with Expo Go, or open the web URL on a phone
	cd apps/mobile && npx expo start

web:
	cd frontend && npm run dev

test:  ## Backend test suite
	cd backend && uv run pytest

lint:  ## All linters and type checkers
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy app
	cd frontend && npm run lint && npm run typecheck
	cd apps/mobile && npm run typecheck

format:
	cd backend && uv run ruff format . && uv run ruff check --fix .

gen-client:  ## Regenerate frontend API types from the backend's OpenAPI spec
	cd backend && uv run python -m scripts.export_openapi > ../frontend/openapi.json
	cd frontend && npm run gen:api
	cd apps/mobile && npm run gen:api

check-client: gen-client  ## Fail if generated API types are out of date
	git diff --exit-code -- frontend/openapi.json frontend/src/api/schema.ts apps/mobile/src/api/schema.ts
