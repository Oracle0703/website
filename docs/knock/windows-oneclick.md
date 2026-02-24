# Knock Windows One-Click Deploy (NSSM + Nginx)

Use this when you want a prebuilt zip deploy on Windows (no `npm install` on the server).

Important: Knock uses `better-sqlite3` (native module), so the zip must be built on Windows with the same CPU arch + Node major (Node 22).

## TL;DR

### 1) Windows build machine (build + pack zip)

```powershell
# Run in repo root
powershell -ExecutionPolicy Bypass -File .\docs\knock\scripts\knock-pack-win.ps1 -Repo (Get-Location).Path -OutDir C:\temp
```

After it prints `Packed: ...zip`, copy that zip to the server.

### 2) Server (config + deploy + install first time + verify)

```powershell
New-Item -ItemType Directory -Force -Path C:\services\knock | Out-Null
Set-Content -Path C:\services\knock\config.env -Encoding utf8 -Value @(
  "KNOCK_PORT=3010",
  "KNOCK_SITE_NAME=meaningful.ink",
  "KNOCK_LOG_PATH=C:\REPLACE\WITH\ABSOLUTE\NGINX\ACCESS.LOG",
  "KNOCK_DATA_DIR=C:\services\knock\data",
  "KNOCK_RETENTION_DAYS=14",
  "KNOCK_INGEST_INTERVAL_SEC=60",
  "KNOCK_WINDOW_DEFAULT=24h"
)

powershell -ExecutionPolicy Bypass -File .\docs\knock\scripts\knock-deploy.ps1 -ZipPath C:\temp\knock-win64-YYYYMMDD-HHMMSS.zip

# First deploy only (skip on later deploys)
powershell -ExecutionPolicy Bypass -File .\docs\knock\scripts\knock-install.ps1

Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3010/healthz
```

If deploy runs before first install, `knock-deploy.ps1` prints a reminder and exits cleanly; then run install once.

## What the pack script ships

`docs/knock/scripts/knock-pack-win.ps1` stages only:
- `dist/server.js`
- `dist/public/**`
- `.env.example`
- `node_modules` for minimal runtime deps (`better-sqlite3`)

It does **not** ship `dist/src` or `dist/test`.

## Server layout

- `C:\services\knock\releases\<timestamp>`
- `C:\services\knock\releases\current` (junction)
- `C:\services\knock\data` (SQLite + state)
- `C:\services\knock\config.env`

## Scripts

- `docs/knock/scripts/knock-pack-win.ps1`
- `docs/knock/scripts/knock-deploy.ps1`
- `docs/knock/scripts/knock-install.ps1`
- `docs/knock/scripts/knock-rollback.ps1`

Service name default: `knock`

## Nginx reverse proxy example

```nginx
server {
  listen 80;
  server_name knock.meaningful.ink;

  location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```
