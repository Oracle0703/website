# Repository Guidelines

## Project Structure & Module Organization
Frontend code lives under `apps/website/` as a Next.js 14 App Router project. Routes live in `apps/website/app/` (home, `/enter`, `/blog`, `/labs`, `/tracker`), shared UI in `apps/website/components/`, and assets in `apps/website/public/`. Backend planning/docs live under `backend/`. Project specs and planning notes are at repo root (e.g., `FRONTEND_HOME_SPEC.md`, `BLOG_SPEC.md`).

## Build, Test, and Development Commands
Run these from `apps/website/`:
- `npm install` to install dependencies.
- `npm run dev` to start the local dev server.
- `npm run build` to produce a production build.
- `npm run start` to run the production server locally.
- `npm run lint` to apply ESLint rules.
If the project uses a different package manager, mirror the same scripts with `pnpm` or `yarn`.

## Coding Style & Naming Conventions
Use TypeScript for app code and follow ESLint rules once configured. Until a formatter is added, prefer 2-space indentation in JS/TS and JSON. Name React components in `PascalCase`, hooks as `useThing`, and keep route segments in `kebab-case` under `app/`.

## Testing Guidelines
Testing is not set up yet. If you introduce tests early, keep unit tests colocated as `*.test.ts`/`*.test.tsx` or under `__tests__/`, and add a `npm test` script. Plan for both unit and E2E coverage once the test stack is chosen.

## Commit & Pull Request Guidelines
No Git history is present in this repo yet, so there are no established commit conventions. If you are starting history, use Conventional Commits (e.g., `feat: add blog list`, `fix: correct MDX rendering`) and keep commits scoped. Pull requests should describe the change, link any related issues, include screenshots for UI changes, and list the commands you ran.

## Security & Configuration Tips
Store secrets in `.env.local` and never commit them. Add a checked-in `.env.example` when environment variables are introduced so others can bootstrap safely.
