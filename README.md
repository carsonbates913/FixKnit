# FixKnit

**Revive, repair, reimagine.** FixKnit helps people repair damaged clothing with crochet, knitting
and embroidery. Upload a photo of a garment to get its type and material, a material-specific repair
guide, and design inspiration. You can also browse repair designs by technique and colour.

## Architecture

```
frontend/  React 19 + TypeScript + Vite, Tailwind v4 + shadcn/ui, TanStack Query
   │  /api  (Vite dev proxy)
   ▼
backend/   FastAPI + Pydantic
   ├── api/routes      analysis · inspiration · guides · health
   ├── domain/         taxonomy, label → garment/material matching, repair guides, search queries
   ├── providers/      pluggable external services behind Protocols
   │     ├── vision/       google_vision · fake
   │     └── inspiration/  google_cse · fake
   └── data/repair_guides.yaml
```

- **The API contract is the source of truth.** FastAPI emits OpenAPI, and `make gen-client` turns it
  into `frontend/src/api/schema.ts` (types plus enum value arrays). CI fails if the two drift apart.
- **Providers are swappable.** Routes depend on the `VisionProvider` / `InspirationProvider`
  protocols, not on Google. Set `VISION_PROVIDER` / `INSPIRATION_PROVIDER` to `google` or `fake`.
  The fakes need no keys and are what the tests use.
- **Images never touch disk.** Uploads are validated, EXIF-rotated and downscaled in memory before
  they reach a provider.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/analysis` | Multipart image → garments, materials (with confidence), repair guides, raw labels |
| `GET /api/inspiration?q=&techniques=&colors=` | Inspiration images for a search |
| `GET /api/guides`, `GET /api/guides/{material}` | Repair guides |
| `GET /api/health` | Liveness |

Interactive docs: http://localhost:8000/docs

## Design system: Stitch Precision

A Swiss, grid-led look: **Hanken Grotesk** for type, **JetBrains Mono** for labels and data, signal green
with **cobalt** as the second signal, 1px edges, 3–12px radii and a 4px spacing grid. Light and dark themes follow
the OS, with a toggle in the nav.

- Tokens: `frontend/src/styles/index.css` (CSS variables mapped into Tailwind: `bg-surface`, `text-primary-ink`,
  `bg-signal-soft`, …) plus the `sheen`, `grid-paper` and `eyebrow` utilities.
- Brand: `components/brand/Logo.tsx` (eight knit stitches forming an F; the cobalt stitch is the repair) and
  `components/brand/StitchGrid.tsx` (the stitch-grid motif).
- The green yarn ball (`assets/green-yarn.webp`) is the only illustration, used for the hero and loading states.

## Mobile app (`apps/mobile`)

The product is an **Expo (React Native) app** that runs on iOS, Android and the web from one codebase.
Guests tap *Continue as guest*, choose a name, and can immediately:

- **Post a creation**: up to four photos, a caption, technique and tags, saved to the shared community feed.
- **Fix something**: photograph damage, get a diagnosis with ranked repair options, start a project.
- **Track a project**: tick off steps, log progress photos, add the finished photo, share a before/after post.
- **Browse and like** everyone's posts; view any maker's profile; manage appearance and delete their account.

### Run the demo locally (phones on the same wifi)

```sh
make db       # local Supabase in Docker + migrations
make api      # FastAPI on 0.0.0.0:8000
make mobile   # Expo dev server
```

- **Any phone browser:** open `http://<your-mac-ip>:8081` (press `w` in the Expo terminal first). No install needed.
  The app finds the API and Supabase on the same host automatically.
- **Expo Go:** scan the QR code in the terminal.

### Repair assistant (AI)

`ADVISOR_PROVIDER=claude` uses Claude to diagnose photos and answer questions in each project's chat;
`fake` (the default, and what tests use) returns three sample diagnoses and canned replies.

- **Diagnosis:** one forced tool call returns the garment, material, damage and 2–3 repair plans, validated
  against the same Pydantic schema the API serves. Photos that aren't a damaged garment come back with an
  `outcome` (`no_damage`, `not_garment`, `unclear`) and a retake tip instead of an invented repair.
- **Project chat:** each question is sent with the plan, which steps are done, the user's notes, and the
  before and latest photos.
- **Limits:** `DIAGNOSES_PER_HOUR` and `CHAT_MESSAGES_PER_HOUR` cap each user, so a public demo can't run
  up the bill.

It works with Anthropic directly or any gateway that speaks the Messages API, such as Dartmouth Chat:

```sh
# backend/.env (never committed)
ADVISOR_PROVIDER=claude
ANTHROPIC_API_KEY=...                            # Anthropic key, or your Dartmouth Chat API key
ANTHROPIC_BASE_URL=https://chat.dartmouth.edu/api # omit for Anthropic directly
ADVISOR_MODEL=anthropic.claude-sonnet-4-6         # Dartmouth's id; Anthropic's is claude-sonnet-5-5
```

## Getting started

Requirements: [uv](https://docs.astral.sh/uv/), Node 24+. Alternatively, use Docker.

```sh
cp backend/.env.example backend/.env   # defaults to fake providers, no keys needed
make install
make dev                               # API on :8000, web on http://localhost:5173
```

Or, with no local toolchain: `docker compose up`.

### Using the real Google APIs

1. Create a GCP service account with the Cloud Vision API enabled. **Billing must be enabled** on the
   project. Store the JSON key *outside* the repo, e.g. `~/.config/fixknit/service-account.json`.
2. In `backend/.env` set `VISION_PROVIDER=google` and `GOOGLE_APPLICATION_CREDENTIALS=<path>`.
3. Inspiration search uses Google's Custom Search JSON API (`GOOGLE_API_KEY`, `GOOGLE_CSE_ID`).
   It is closed to new customers and **shuts down on 2027-01-01**, so keep `INSPIRATION_PROVIDER=fake`
   until a replacement provider exists.

## Development

| Command | What it does |
| --- | --- |
| `make test` | Backend tests (pytest, fake providers, no network) |
| `make lint` | ruff + mypy (strict) + eslint + tsc |
| `make format` | Auto-format the backend |
| `make gen-client` | Regenerate frontend API types after changing backend schemas |

Optional git hooks: `uvx pre-commit install`.

### Adding a provider

Implement the protocol in `backend/app/providers/<kind>/base.py`, add a branch to that package's
`build_*_provider`, and extend the `ProviderKind` literal in `app/config.py`.
