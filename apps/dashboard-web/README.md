# dashboard-web

A minimal Next.js dashboard UI for `dashboard-api`.

## Local dev

From repo root:

```bash
npm install
npm run dev -w apps/dashboard-web
```

Then open:

- http://localhost:3000/dashboard

### Environment

- `NEXT_PUBLIC_DASHBOARD_API_BASE` (optional)
  - default: `https://ms.meaningful.ink/api/dashboard`

Create `apps/dashboard-web/.env.local` if needed:

```bash
NEXT_PUBLIC_DASHBOARD_API_BASE=http://localhost:8787/api/dashboard
```

## Pages

- `/dashboard` login (POST `/auth/login`, stores token in `localStorage`)
- `/dashboard/tasks` tasks list + create + status update
- `/dashboard/logs` logs list
- `/dashboard/status` status text editor

## Deploy behind Nginx (basePath=/dashboard)

This app is built with `basePath: "/dashboard"` (see `apps/dashboard-web/next.config.js`).

Typical Nginx reverse proxy:

```nginx
location /dashboard/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Run the server:

```bash
npm run build -w apps/dashboard-web
npm run start -w apps/dashboard-web -- -p 3001
```

Notes:
- Requests will include `/dashboard/_next/...` for assets; proxying `/dashboard/` is enough.
- API base is configured via `NEXT_PUBLIC_DASHBOARD_API_BASE`.
