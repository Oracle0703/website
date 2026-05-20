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

- Node.js 22 (`>=22 <23`)
- npm 9+

The root `.nvmrc` and `.node-version` both pin the supported Node major for local tooling. On Windows, make sure the active shell resolves to Node 22 before running tests or verification scripts.

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

npm run test                  # root Node test suite
npm run test:workspace        # monorepo scaffold smoke test
npm run validate:website-content
npm run verify:website-static
npm run verify:website-browser
```

## Website verification

Run website checks from the repository root after installing dependencies:

| Command | Purpose |
|---|---|
| `npm run validate:website-content` | Validate published MDX metadata, image alt text, series ordering, and draft references. |
| `npm run build:website` | Build the Next.js website production output. |
| `npm run verify:website-static` | Start the production website and verify public static entrypoint HTML and Next.js script bundles. |
| `npm run verify:website-browser` | Run Playwright desktop/mobile checks for public routes, detail routes, preference restore, console errors, and screenshots. |

Port handling is explicit:

| Verifier | Default | Override | Occupied port behavior |
|---|---:|---|---|
| `npm run verify:website-static` | `4321` | `NEXT_STATIC_VERIFY_PORT=4325 npm run verify:website-static` | Default port falls forward to the next available port; an occupied explicit port fails with `EADDRINUSE`. |
| `npm run verify:website-browser` | `4323` | `WEBSITE_BROWSER_VERIFY_PORT=4327 npm run verify:website-browser` | Default port falls forward to the next available port; an occupied explicit port fails with `EADDRINUSE`. |

To verify a deployed preview without starting a local website server:

```bash
NEXT_STATIC_VERIFY_BASE_URL=https://example.com npm run verify:website-static
```

## Workspace conventions

- Workspaces are declared at root in `package.json` (`apps/*`, `packages/*`).
- Keep a single lockfile at root (`package-lock.json`).
- Do not create nested lockfiles under `apps/*` or `packages/*`.
- Legacy `frontend/` is intentionally removed; `apps/website/` is the active website app.
