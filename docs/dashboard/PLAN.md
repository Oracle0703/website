# Dashboard Monorepo + OSS Storage Plan

Owner: Yu
Agent: jarvis

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

## Monorepo Structure
- `apps/website/` (migrated from prior `frontend/`)
- `apps/dashboard-web/` (planned)
- `apps/dashboard-api/` (planned)
- `packages/*` (planned, for shared theme/config)

## OSS Data Layout
Bucket: TBD (Yu will create)
Prefix: `dashboard/`
- `dashboard/tasks.json`
- `dashboard/status.json`
- `dashboard/logs/YYYY-MM-DD.json` (partition by day, append-only)

## API Surface (v1)
- `POST /api/auth/login` -> `{ token }`
- Tasks: `GET/POST/PATCH`
- Logs: `GET /api/logs?days=7&limit=200`, `POST /api/logs` (append)
- Status: `GET/POST`

## Consistency Rules
- `tasks.json`: ETag + If-Match optimistic concurrency; mismatch -> 409
- logs: append-only partitions; avoid overwrites

## Unit Test Requirements (Mandatory)
- `apps/dashboard-api`
  - storage get/put + ETag mismatch
  - auth happy/failed
  - route tests (supertest)
- `apps/dashboard-web`
  - smoke tests (render + fetch via mocked API)

## Milestones (MRs)
- MR #1: monorepo scaffold + migrate `frontend/` -> `apps/website/` + root scripts + minimal tests
- MR #2: dashboard-api OSS backend + tests
- MR #3: dashboard-web Next app + tests
