# meaningful.ink monorepo

This repository is an npm-workspaces monorepo with a single root lockfile.

## Directory layout

- `apps/website/`: Main website (Next.js)
- `apps/dashboard-web/`: Dashboard web app (Next.js)
- `apps/dashboard-api/`: Dashboard API (Node.js + TypeScript)
- `apps/knock/`: Knock service (Node.js + TypeScript)
- `packages/`: Shared workspace packages
- `content/`: Website content source files
- `docs/`: Architecture notes, migration records, and runbooks
- `tests/`: Root smoke tests for monorepo scaffolding

## Prerequisites

- Node.js LTS
- npm 9+

## Install

Run from repository root:

```bash
npm install
```

## Root scripts

```bash
npm run dev                   # same as dev:website
npm run dev:website
npm run dev:dashboard-web
npm run dev:dashboard-api
npm run dev:knock

npm run build                 # same as build:website
npm run build:website
npm run build:dashboard-web
npm run build:dashboard-api
npm run build:knock

npm run test                  # monorepo scaffold smoke test
```

## Workspace conventions

- Workspaces are declared at root in `package.json` (`apps/*`, `packages/*`).
- Keep a single lockfile at root (`package-lock.json`).
- Do not create nested lockfiles under `apps/*` or `packages/*`.
- Legacy `frontend/` is intentionally removed; `apps/website/` is the active website app.
