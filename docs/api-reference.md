# API Reference

Base URL:
- Local: `http://localhost:8080`
- Production: `https://api.goldtrade.markets`

All responses use the envelope `{ "success": bool, "data"?: T, "message"?, "error"? }`.

**Auth column:**
- **Public** — no token needed.
- **Investor/Admin** — any valid access token (send `Authorization: Bearer <token>`).
- **Admin** — requires an admin token (`/api/admin/**`).

---

## Health

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | Public | Liveness probe |

---

## Auth — `/api/auth`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | Public | Create an investor account. Body: `email`, `password` (≥8), `full_name`, `phone_number`, optional `referral_code`. Sends verification email. |
| POST | `/api/auth/login` | Public | Log in. Body: `email`, `password`. Returns `access_token`, `refresh_token`, `user`. Requires the account to be email‑verified & approved. |
| GET | `/api/auth/me` | Investor/Admin | Current user profile (id, email, name, role, `goldtrade_id`, `referral_code`, …). |
| POST | `/api/auth/refresh` | Public | Exchange a valid refresh token for a new access token. Body: `refresh_token`. |
| POST | `/api/auth/logout` | Public | Revoke a refresh token. |
| PUT | `/api/auth/profile` | Investor/Admin | Update `full_name`. |
| PUT | `/api/auth/change-password` | Investor/Admin | Change password. |
| POST | `/api/auth/send-verification` | Public | Send a verification email. |
| POST | `/api/auth/resend-verification` | Public | Resend the verification email. |
| GET / POST | `/api/auth/verify-email` | Public | Verify an email via `token` (also approves the account). |
| POST | `/api/auth/forgot-password` | Public | Start password reset (emails a reset link). Body: `email`. |
| POST | `/api/auth/reset-password` | Public | Complete reset. Body: `token`, `password`. |

---

## Market / Gold price

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/market/gold` | Public | Today's stored gold price. Returns `{ price, date }`. |
| GET | `/api/market/gold/history?days=30` | Public | Stored daily history (default 30 days) as `[{ date, price }]`. |
| PUT | `/api/admin/market/gold` | Admin | Set today's gold price. Body: `{ price }`. |

---

## Portfolio (investor) — `/api/portfolio`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/portfolio` | Investor | Overview: `cash_balance`, `principal_balance`, `total_value`. |
| GET | `/api/portfolio/transactions` | Investor | Full transaction history (newest first). |
| GET | `/api/portfolio/deposit-requests` | Investor | Own deposit requests. |
| POST | `/api/portfolio/deposit-requests` | Investor | Submit a deposit request. Body: `payment_method` (`binance`), optional `transaction_reference`. **No amount** — the admin sets it at approval. |
| GET | `/api/portfolio/withdrawals` | Investor | Own withdrawal requests. |
| POST | `/api/portfolio/withdrawals` | Investor | Request a withdrawal. Body: `amount`, `method` (`jazzcash` or `binance`), `account_number` (payout destination). |
| GET | `/api/portfolio/referrals` | Investor | Referral code, referred users, earnings, and total earned. |

---

## Notifications — `/api/notifications`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/notifications` | Investor/Admin | List notifications. |
| GET | `/api/notifications/unread-count` | Investor/Admin | `{ count }` of unread. |
| POST | `/api/notifications/mark-read-section` | Investor/Admin | Mark a section's notifications read. |
| POST | `/api/notifications/mark-all-read` | Investor/Admin | Mark all read. |
| DELETE | `/api/notifications` | Investor/Admin | Clear all notifications for the current user. |

---

## Settings (read) — public‑to‑members

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/settings/deposit-whatsapp` | Investor/Admin | WhatsApp number shown on the deposit flow. |
| GET | `/api/settings/payment-methods` | Investor/Admin | `binance_address`, `binance_network`. |

---

## Admin — `/api/admin/**` (admin token required)

### Overview & finance

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/overview` | Total AUM, treasury, investor count, pending requests. |
| GET | `/api/admin/finance/overview` | Deposits, referral bonuses, daily profits, withdrawals, net flow. |
| GET | `/api/admin/finance/transactions` | Platform‑wide transaction feed. |
| POST | `/api/admin/finance/run-daily-profit` | **Manually** trigger the daily‑profit run (normally automatic). Idempotent per day. |

### Deposit requests

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/deposit-requests` | All deposit requests. |
| POST | `/api/admin/deposit-requests/{id}/approve` | Approve. Body: `{ amount }`. Credits cash + principal, pays 5% referral bonus if applicable. |
| POST | `/api/admin/deposit-requests/{id}/reject` | Reject. |

### Withdraw requests

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/withdrawals` | All withdrawal requests (includes payout destination + method). |
| POST | `/api/admin/withdrawals/{id}/approve` | Approve (deducts from cash balance). |
| POST | `/api/admin/withdrawals/{id}/reject` | Reject. |

### Investors

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/investors` | Investor list with status + portfolio value. |
| GET | `/api/admin/investors/{id}` | Single investor detail + transactions. |
| POST | `/api/admin/investors/{id}/approve` | Manually approve an account. |
| POST | `/api/admin/investors/{id}/reject` | Reject an account (with reason). |

### Treasury

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/treasury` | Current treasury balance. |
| POST | `/api/admin/treasury/transfer` | Transfer to an investor. Body: `{ investor_id, amount }`. Credits their cash + principal. |

### Admin settings

| Method | Path | Purpose |
|--------|------|---------|
| PUT | `/api/admin/settings/deposit-whatsapp` | Update the deposit WhatsApp number. |
| PUT | `/api/admin/settings/payment-methods` | Update `binance_address`, `binance_network`. |
| PUT | `/api/admin/market/gold` | Set today's gold price (also listed under Market). |

---

## Example: full deposit lifecycle

```bash
# 1. Investor submits a deposit request (no amount)
curl -X POST $API/api/portfolio/deposit-requests \
  -H "Authorization: Bearer $INVESTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"payment_method":"binance","transaction_reference":"TXID123"}'

# 2. Admin lists pending requests, then approves with the confirmed amount
curl -X POST $API/api/admin/deposit-requests/$REQUEST_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"amount":1000}'
# → investor cash +1000, principal +1000; referrer (if any) cash +50 (5%)
```
