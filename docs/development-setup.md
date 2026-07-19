# Development Setup

How to run GoldTrade on your machine.

## Prerequisites

- **Node.js** 20+ and npm (frontend)
- **Java** 17 (backend) — the repo ships the Maven wrapper (`mvnw` / `mvnw.cmd`), so
  you don't need Maven installed
- Access to the **Supabase Postgres** database (URL + credentials) and a **Resend**
  API key for email

## 1. Configure environment variables

The frontend holds no secrets; the backend holds all of them.

**`backend/.env`** (copy from `backend/.env.example`):

| Variable | What it is |
|----------|------------|
| `SUPABASE_DB_URL` | JDBC URL to the Supabase Postgres (transaction pooler, port 6543) |
| `SUPABASE_DB_USERNAME` | `postgres.<project_ref>` |
| `SUPABASE_DB_PASSWORD` | database password |
| `JWT_SECRET` | any long random string for signing access tokens |
| `RESEND_API_KEY` | `re_...` from resend.com |
| `RESEND_FROM_EMAIL` | e.g. `GoldTrade <noreply@goldtrade.markets>` |
| `ADMIN_NOTIFICATION_EMAIL` | an inbox for admin alerts |
| `APP_URL` | `http://localhost:3000` for local |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` for local |
| `SECURITY_TRUST_FORWARDED_FOR` | `false` locally |

**`frontend/.env.local`** (copy from `frontend/.env.example`):

| Variable | Value (local) |
|----------|---------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

> `.env` / `.env.local` are gitignored. Never commit real secrets — only the
> `.env.example` templates are tracked.

## 2. Run both apps

On Windows, the quickest way is the root script:

```
start-dev.bat
```

Or run them separately:

```bash
# Backend  → http://localhost:8080
cd backend
./mvnw.cmd spring-boot:run     # (./mvnw spring-boot:run on macOS/Linux)

# Frontend → http://localhost:3000
cd frontend
npm install        # first time only
npm run dev
```

## 3. Verify it's up

- `GET http://localhost:8080/api/health` → `{"status":"ok"}` (or `success:true`)
- Open `http://localhost:3000` — the landing page should render with a live gold
  rate (proves the frontend reached the backend).
- Log in as the seeded admin (`administrator@goldtrade.com` / `abdullah@2026`) or
  register a new investor via `/join`.

## Useful checks while developing

```bash
# Type-check the frontend (fast, no build)
cd frontend && npx tsc --noEmit

# Compile the backend
cd backend && ./mvnw.cmd -q compile

# Full production build of the frontend (touches every route)
cd frontend && npm run build
```

> **Gotcha:** if `tsc --noEmit` reports errors inside `.next/dev/types/*`, delete the
> stale generated cache (`rm -rf frontend/.next/dev`, or `rm -rf frontend/.next` for a
> full clean) and re‑run — those are generated‑file artifacts, not real code errors.

## Notes on the local database

Local development points at the **same shared Supabase database** as the deployed app
(there's no separate local DB by default). That means:

- Data you create locally is real data in that database.
- The schema is already live — there is no migration step to run.
- Be careful with destructive changes; they affect everyone using that database.
