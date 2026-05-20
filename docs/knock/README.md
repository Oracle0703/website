# Knock (Who is knocking)

MVP dashboard to visualize Nginx access logs on the server.

Dashboard highlights:
- KPIs for total requests, unique IPs, 4xx ratio, and suspicious hits.
- Traffic chart with 2xx/3xx/4xx/5xx breakdown for the selected window.
- Top IP/path tables plus a latest suspicious table with filters.

## Quick start (dev)

```bash
npm i
npm run build:knock
npm run dev:knock
```

Then open: http://127.0.0.1:3010/

## Build + test (local)

```bash
npm run build:knock
npm run test -w knock
```

Build output: `apps/knock/dist/server.js` + `apps/knock/dist/public/`.
Test compile output: `apps/knock/.test-dist/` (ignored, never packaged).

Release zip should only contain runtime artifacts under `dist/server.js` and `dist/public/`.
`docs/knock/scripts/knock-pack-win.ps1` installs minimal runtime deps in stage (`better-sqlite3` only).

## Config

Copy `apps/knock/.env.example` to `apps/knock/.env` (or provide env vars via service).

Required:
- `KNOCK_LOG_PATH` (absolute path to your Nginx access log)

Optional:
- `KNOCK_PORT` (default 3010)
- `KNOCK_SITE_NAME` (default `knock`)
- `KNOCK_AUTH_USERNAME` / `KNOCK_AUTH_PASSWORD` (enables Basic Auth; required if exposed beyond localhost)
- `KNOCK_DATA_DIR` (default `./data`, contains `knock.db` and `state.json`)
- `KNOCK_RETENTION_DAYS` (default 14)
- `KNOCK_INGEST_INTERVAL_SEC` (default 60, min 5)
- `KNOCK_WINDOW_DEFAULT` (`1h`/`24h`/`7d`, default `24h`)
- `KNOCK_DISABLE_INGEST` (`true`/`false`, default `false`)

Notes:
- Do not expose Knock publicly without `KNOCK_AUTH_USERNAME` and `KNOCK_AUTH_PASSWORD` or equivalent Nginx access control.
- `KNOCK_DATA_DIR` is resolved from the current working directory; in services use absolute paths.
- Logs should be UTF-8 (Nginx default). Non-UTF8 content may appear garbled but parsing still relies on ASCII fields.

## Deployment (Windows)

See `gitee/website/docs/knock/windows-oneclick.md`.
