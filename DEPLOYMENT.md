# GoldTrade — Deployment Guide

Production stack:

- **Frontend** → Vercel (Next.js) — `frontend/`
- **Backend** → Railway (Spring Boot, Docker) — `backend/`
- **Database** → Supabase Postgres (already provisioned; the schema is live)
- **Email** → Resend (domain `goldtrade.markets` must show **Verified** in Resend → Domains)

The frontend holds no secrets and no DB credentials — it talks only to the backend, which owns
auth and all data access.

---

## Deploy order (important)

There's a chicken-and-egg between the two URLs, so do it in this order:

1. **Deploy the backend to Railway** → note its public URL, e.g. `https://goldtrade-backend.up.railway.app`.
2. **Deploy the frontend to Vercel** with `NEXT_PUBLIC_API_URL` pointing at that backend URL → note its URL, e.g. `https://gold-trade.vercel.app`.
3. **Update the backend's `CORS_ALLOWED_ORIGINS` and `APP_URL`** on Railway to the Vercel URL, then redeploy the backend.

---

## 1. Backend on Railway

Railway builds from `backend/Dockerfile` (config in `backend/railway.json`, healthcheck at `/api/health`).

**Create the service:** New Project → Deploy from GitHub repo → set the service **Root Directory** to `backend`.

**Set these environment variables** (Railway → service → Variables):

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_DB_URL` | `jdbc:postgresql://<pooler-host>.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&stringtype=unspecified&prepareThreshold=0` | Supabase → Connect → Transaction pooler |
| `SUPABASE_DB_USERNAME` | `postgres.<project_ref>` | |
| `SUPABASE_DB_PASSWORD` | the DB password | |
| `JWT_SECRET` | a fresh long random string | **generate a new one** (see below) — do not reuse the dev secret |
| `RESEND_API_KEY` | `re_...` | resend.com/api-keys |
| `RESEND_FROM_EMAIL` | `GoldTrade <noreply@goldtrade.markets>` | domain must be Verified in Resend |
| `ADMIN_NOTIFICATION_EMAIL` | an admin inbox | |
| `APP_URL` | the Vercel URL | set after step 2 |
| `CORS_ALLOWED_ORIGINS` | the Vercel URL(s), comma-separated | set after step 2, e.g. `https://gold-trade.vercel.app` |
| `SECURITY_TRUST_FORWARDED_FOR` | `true` | Railway is a trusted proxy that sets X-Forwarded-For; enables real-client-IP rate limiting |

**Do NOT set `PORT`** — Railway injects it and the app binds to it automatically.

Generate a production JWT secret:

```bash
openssl rand -base64 48
```

Railway auto-detects the Dockerfile and the `/api/health` healthcheck; no start command needed.

---

## 2. Frontend on Vercel

**Import the repo** → set the project **Root Directory** to `frontend` (Vercel auto-detects Next.js; `frontend/vercel.json` pins the framework).

**Set these environment variables** (Vercel → Project → Settings → Environment Variables, all environments):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | the Railway backend URL, e.g. `https://goldtrade-backend.up.railway.app` |
| `NEXT_PUBLIC_APP_URL` | the Vercel URL, e.g. `https://gold-trade.vercel.app` |

`NEXT_PUBLIC_*` vars are baked in at build time, so **redeploy after changing them**.

---

## 3. Wire the two together

Back on Railway, set `APP_URL` and `CORS_ALLOWED_ORIGINS` to the Vercel URL and redeploy the backend.
If you use Vercel **preview** deployments (per-branch URLs) and want them to reach the prod backend,
add each preview origin to `CORS_ALLOWED_ORIGINS` too (or point previews at a separate backend).

---

## 4. Verify

- `GET https://<backend>/api/health` → `{"status":"ok"}`
- Open the Vercel URL, register/log in, load the investor dashboard (gold rate + data should load — that proves CORS and the backend link work).
- Confirm a verification email arrives (Resend domain verified).

---

## Notes

- **Database**: the Supabase project is already provisioned and the schema (including `refresh_tokens`,
  `treasury`, and the `version` optimistic-lock columns) is live. Production points at this same
  database — there is no separate migration step. If you ever stand up a fresh DB, the schema must be
  recreated first.
- **HTTPS**: both platforms serve HTTPS, so the HSTS header (set by the app) takes effect automatically.
- **Secrets**: never commit real values. `.env` / `.env.local` are gitignored; only the `.env.example`
  files are tracked.
- **Seed accounts**: the seeded test logins are for the shared dev database. Change or remove them
  before real users arrive.
