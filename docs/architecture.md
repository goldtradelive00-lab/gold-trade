# Architecture

## Stack overview

| Layer | Technology | Hosting |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui, TanStack Query, Zustand, Recharts | Vercel |
| **Backend** | Spring Boot 3.5 (Java 17, Maven) | Railway (Docker) |
| **Database** | PostgreSQL | Supabase |
| **Email** | Resend REST API | — |

The frontend talks **only** to the Spring Boot backend over REST/JSON. The backend
owns all business logic, authentication, and the database connection. Supabase is
used purely as a managed Postgres database (the app issues its own JWTs — it does
**not** use Supabase Auth).

```
 Browser ──HTTPS──▶ Next.js (Vercel) ──REST/JSON──▶ Spring Boot (Railway) ──JDBC──▶ Postgres (Supabase)
                                                          │
                                                          └──REST──▶ Resend (email)
```

---

## Repository layout

```
GoldTrade/
├── frontend/                 Next.js app
│   └── src/
│       ├── app/              Route handlers (App Router) — see "Routes" below
│       ├── components/       UI + layout + feature components
│       ├── lib/              api client, auth, utils, session, content
│       ├── stores/           Zustand stores (auth-store)
│       └── types/            Shared TypeScript types (domain.ts)
├── backend/                  Spring Boot app
│   └── src/main/java/com/goldtrade/backend/
│       ├── config/           SecurityConfig, WebConfig
│       ├── controller/       REST controllers (one per resource area)
│       ├── dto/response/     ApiResponse<T> wrapper
│       ├── entity/           JPA entities (one per table)
│       ├── exception/        Global handler + custom exceptions
│       ├── repository/       Spring Data JPA repositories
│       ├── security/         JwtAuthFilter, JwtService, RateLimitFilter
│       └── service/          Business logic (profit, email, notifications, gold price)
├── docs/                     This documentation
├── README.md                 Quick start
├── DEPLOYMENT.md             Infra notes
└── start-dev.bat             Runs both apps locally (Windows)
```

---

## Frontend routes

Public / marketing:

- `/` — landing page (hero, gold chart, how‑it‑works, footer)
- `/how-it-works`
- `/product/[slug]`, `/company/[slug]`, `/legal/[slug]` — footer content pages

Auth:

- `/login`, `/join`, `/forgot-password`, `/reset-password`
- `/verify-email`, `/verify-email-pending`

Investor (auth‑gated, role `investor`):

- `/investor/dashboard`, `/investor/deposit`, `/investor/withdraw`,
  `/investor/refer`, `/investor/settings`

Admin (auth‑gated, role `admin`):

- `/admin/overview`, `/admin/finance`, `/admin/deposit-requests`,
  `/admin/withdrawals`, `/admin/investors`, `/admin/investors/[id]`,
  `/admin/settings`

Route protection is enforced in the layout components: on mount they call
`/api/auth/me`, redirect to `/login` if unauthenticated, and cross‑redirect if the
role doesn't match the section (an investor hitting `/admin/*` is sent to their
dashboard, and vice‑versa). The backend independently enforces roles too.

---

## Authentication

The backend owns authentication end‑to‑end:

- **Passwords** are hashed with **bcrypt**.
- On login the backend issues a short‑lived **access token** (self‑signed **JWT**,
  HS256, secret from `JWT_SECRET`) and a long‑lived **refresh token** (stored hashed
  in the `refresh_tokens` table).
- The frontend stores both tokens in `localStorage` (`gt-access-token`,
  `gt-refresh-token`) and sends `Authorization: Bearer <access token>` on every
  request via the `api` client. On a 401 it transparently calls `/api/auth/refresh`.
- **`JwtAuthFilter`** validates the access token on protected routes and puts the
  user id + role into the security context.
- **Email verification is required to log in.** Clicking the verification link both
  verifies the email and approves the account.

### Route authorization (backend)

- **Public:** `GET /api/health`, `GET /api/market/gold`,
  `GET /api/market/gold/history`, and the `/api/auth/*` endpoints for
  register / login / refresh / logout / email‑verification / password‑reset.
- **Admin only:** everything under `/api/admin/**` (requires role `ADMIN`).
- **Authenticated:** everything else (any valid token).

A **rate‑limit filter** guards the auth endpoints against brute force.

---

## Key backend services

| Service | Responsibility |
|---------|----------------|
| `DailyProfitService` | Credits each investor `1% × principal` to cash, once per day. Scheduled `@Scheduled(cron = "0 0 0 * * *")` (midnight, server time). Idempotent per calendar day (checks for an existing `daily_profit` transaction today). |
| `StartupCatchUp` | Runs the daily‑profit routine once on app startup (`ApplicationReadyEvent`) as a catch‑up, relying on the same per‑day idempotency guard. |
| `GoldPriceHistoryService` | Stores one gold price per calendar day (`gold_price_history`). Auto‑generates today's price by a bounded random walk (±$15/day, default seed `$1500`) if an admin hasn't set it, and back‑fills gaps so the 30‑day chart is always complete. Admin overrides via `setTodayPrice`. |
| `NotificationService` | Creates in‑app notifications for investors and admins (deposit approved, referral bonus, new request, etc.). |
| `EmailService` | Sends branded emails via Resend: verification, approval, password reset. |
| `RefreshTokenService` | Issues, validates, and revokes refresh tokens. |

### Money‑logic constants (source of truth)

- **Daily profit rate:** `0.01` (1%) — `DailyProfitService.DAILY_PROFIT_RATE`
- **Referral commission rate:** `0.05` (5%) — `AdminDepositController.REFERRAL_COMMISSION_RATE`
- **Default gold price:** `$1500.00`, **max daily step:** `$15` — `GoldPriceHistoryService`

---

## API response shape

Every endpoint returns a consistent envelope:

```jsonc
// success
{ "success": true, "data": { … }, "message": "optional" }
// error
{ "success": false, "error": "human-readable message" }
```

See the [API Reference](./api-reference.md) for every endpoint.

---

## Data model summary

Thirteen tables. Investors and admins are **separate** tables. See the
[Database Schema](./database-schema.md) for full details.

- `users` (investors), `admins`
- `portfolios` (1:1 with a user — cash + principal balances)
- `transactions` (ledger, linked to a portfolio)
- `deposit_requests`, `withdraw_requests`
- `referral_earnings`
- `notifications`
- `treasury` (single row: platform funds)
- `gold_price_history` (one row per day)
- `app_settings` (key/value config: WhatsApp number, Binance details)
- `refresh_tokens`, `password_reset_tokens`
