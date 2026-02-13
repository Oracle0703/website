# meaningful.ink monorepo

This repository uses npm workspaces with a single root lockfile.

## Layout

- `apps/website/` - Main website (Next.js)
- `apps/dashboard-web/` - Dashboard web app (Next.js)
- `apps/dashboard-api/` - Dashboard API (Node.js + TypeScript)
- `packages/` - Shared workspace for reusable libraries/configs
- `content/` - Content source files (e.g. blog posts)
- `docs/` - Architecture notes, plans, and audit reports
- `docs/legacy/` - Archived historical specs/plans moved from old root folders

## Prerequisites

- Node.js LTS
- npm (workspaces enabled)

## Install

From repo root:

```bash
npm install
```

## Common scripts (root)

```bash
npm run dev                 # website
npm run dev:dashboard-web
npm run dev:dashboard-api
npm run build:website
npm run build:dashboard-web
npm run build:dashboard-api
npm run test
```

## Workspace rule

- Keep lockfile only at repo root (`package-lock.json`).
- Do not keep per-app lockfiles under `apps/*`.

## Branch conventions

- Feature: `feature/<name>/<YYYYMMDD>/<what>`
- Hotfix: `hotfix/<name>/<YYYYMMDD>/<issue>`
- Open an MR from your branch; merge into `main` only after checks pass.
