# Repository Guidelines

## Project Structure & Module Organization
Frontend code lives under `apps/website/` as a Next.js 14 App Router project. Routes live in `apps/website/app/` (home, `/enter`, `/blog`, `/labs`, `/tracker`), shared UI in `apps/website/components/`, and assets in `apps/website/public/`. Cross-app docs live in repo root `docs/`, and legacy backend/admin plans are archived under `docs/legacy/`.

## Build, Test, and Development Commands
Run these from repo root unless noted:
- `npm install` to install dependencies for all workspaces.
- `npm run dev` to start the website app.
- `npm run build:website` to produce the website production build.
- `npm run lint:website` to apply website ESLint rules.
- `npm run test` to run workspace structure checks.

## Coding Style & Naming Conventions
Use TypeScript for app code and follow ESLint rules once configured. Until a formatter is added, prefer 2-space indentation in JS/TS and JSON. Name React components in `PascalCase`, hooks as `useThing`, and keep route segments in `kebab-case` under `app/`.

## Testing Guidelines
Keep unit tests colocated as `*.test.ts`/`*.test.tsx` or under `__tests__/`. Keep monorepo-level structural checks in root `tests/` so workspace constraints remain enforced.

## Commit & Pull Request Guidelines
Use Conventional Commits (e.g., `feat: add blog list`, `fix: correct MDX rendering`) and keep commits scoped. Pull requests should describe the change, link related issues, include screenshots for UI changes, and list the commands you ran.

## Security & Configuration Tips
Store secrets in `.env.local` and never commit them. Add a checked-in `.env.example` when environment variables are introduced so others can bootstrap safely.
