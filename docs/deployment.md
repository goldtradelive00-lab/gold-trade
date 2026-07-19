# Deployment

Production runs on **Vercel** (frontend) + **Railway** (backend) + **Supabase**
(Postgres) + **Resend** (email).

The full, step‑by‑step deployment guide — with the exact environment variables, the
required deploy order (backend → frontend → wire CORS), and verification steps —
lives in the repository root:

## → [`../DEPLOYMENT.md`](../DEPLOYMENT.md)

### Quick summary

1. **Backend → Railway.** Builds from `backend/Dockerfile`; health check at
   `/api/health`. Set the DB, `JWT_SECRET` (generate a fresh one — don't reuse dev),
   Resend, and `APP_URL` / `CORS_ALLOWED_ORIGINS` variables. Don't set `PORT` —
   Railway injects it. Note the backend's public URL.
2. **Frontend → Vercel.** Root directory `frontend`. Set `NEXT_PUBLIC_API_URL` to the
   Railway URL and `NEXT_PUBLIC_APP_URL` to the Vercel URL. `NEXT_PUBLIC_*` are baked
   in at build time — redeploy after changing them.
3. **Wire them together.** Set the backend's `APP_URL` and `CORS_ALLOWED_ORIGINS` to
   the Vercel URL and redeploy the backend.
4. **Verify.** `GET /api/health` returns ok; the deployed app loads the gold rate and
   lets you register/log in; a verification email arrives (Resend domain verified).

### Things to remember

- The Supabase database and schema are **already provisioned** — production points at
  the same database; there's no separate migration step. If you stand up a fresh DB,
  recreate the schema (see [Database Schema](./database-schema.md)) first.
- Both platforms serve HTTPS, so the app's HSTS header applies automatically.
- Seeded/test accounts are for the shared dev database — change or remove them before
  real users arrive.
