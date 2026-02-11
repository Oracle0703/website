# meaningful.ink monorepo

This repo is organized as an npm workspaces monorepo.

## Layout

- `apps/website/` - Main website (Next.js)
- `apps/dashboard-web/` - Dashboard web app (planned)
- `apps/dashboard-api/` - Dashboard API (planned)
- `content/` - Content source files (e.g. blog posts)

## Prerequisites

- Node.js (LTS recommended)
- npm (workspaces enabled)

## Install

From repo root:

```bash
npm install
```

## Run (website)

From repo root:

```bash
npm run dev
```

Or run explicitly:

```bash
npm run dev -w apps/website
```

## Build / Start (website)

```bash
npm run build
npm run start
```

## Tests

```bash
npm test
```

## Branch conventions

- Feature: `feature/<name>/<YYYYMMDD>/<what>`
- Hotfix: `hotfix/<name>/<YYYYMMDD>/<issue>`
- Open an MR from your branch; merge into `main` only after checks pass.
