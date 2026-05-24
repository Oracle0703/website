# Dashboard Monorepo + OSS Storage Plan

Owner: Yu
Agent: jarvis
Status date: 2026-05-24

## Goal
- Unify stack with existing website: Next.js + Tailwind + CSS variables theme.
- Allow SSR and future expansion.
- Thin backend API (Node.js + TypeScript) reading/writing Aliyun OSS JSON objects.
- Strict branch management; unit tests are the primary quality signal.

## Branch & Commit Conventions
- Feature: `feature/<name>/<YYYYMMDD>/<what>`
- Hotfix: `hotfix/<name>/<YYYYMMDD>/<issue>`
- No direct pushes to `main`.
- Workflow: feature branch -> MR -> Yu merges into `main`.

## Monorepo Structure (current)
- `apps/website/` (active)
- `apps/dashboard-web/` (active)
- `apps/dashboard-api/` (active)
- `packages/*` (reserved for shared theme/config)
- `docs/legacy/` (archived files from historical root-level `backend/` and `admin/`)

## OSS Data Layout
Bucket: TBD (Yu will create)
Prefix: `dashboard/`
- `dashboard/state.json`
- `dashboard/events/YYYY-MM-DD.json` (partition by day, append-only)
- `dashboard/tasks.json`
- `dashboard/status.json`
- `dashboard/logs/YYYY-MM-DD.json` (partition by day, append-only)

## API Surface (v1)
- `POST /api/auth/login` -> `{ token }`
- Ingest: `POST /api/ingest/event` protected by `INGEST_TOKEN`
- State: `GET /api/state`
- Events: `GET /api/events?days=7&limit=200`
- Tasks: `GET/POST/PATCH`
- Logs: `GET /api/logs?days=7&limit=200`, `POST /api/logs` (append)
- Status: `GET/POST`

## Consistency Rules
- `tasks.json`: ETag + If-Match optimistic concurrency; mismatch -> 409
- logs: append-only partitions; avoid overwrites
- events: append-only daily partitions; `Idempotency-Key` deduplicates replays
- state: latest work snapshot derived from ingest events; defaults to stable empty shape

## Unit Test Requirements (Mandatory)
- `apps/dashboard-api`
  - storage get/put + ETag mismatch
  - auth happy/failed
  - route tests for auth, tasks, logs, status, ingest, state, events
- `apps/dashboard-web`
  - smoke tests for dashboard frame rendering and API fetch via mocked API

## Milestones (MRs)
- MR #1: monorepo scaffold + migrate `frontend/` -> `apps/website/` + root scripts + minimal tests (done)
- MR #2: dashboard-api OSS backend + tests (done)
- MR #3: dashboard-web Next app + tests (done)
