# Database Schema

PostgreSQL (hosted on Supabase). Thirteen tables in the `public` schema. Investors
and admins are stored separately. All money columns are `numeric` and represent USD.

> Relationships below note the ON DELETE behavior where relevant. `CASCADE` means
> rows are removed automatically when the parent is deleted.

---

## users (investors)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `email` | text | unique login |
| `password_hash` | text | bcrypt |
| `full_name` | text | |
| `phone_number` | text | |
| `avatar_url` | text | |
| `email_verified` | bool | must be true to log in |
| `verification_token` | text | email‑verify token |
| `verification_token_expires` | timestamptz | |
| `is_approved` | bool | must be true to log in; set true when email is verified |
| `rejection_reason` | text | |
| `kyc_status` | text | |
| `referral_code` | text | e.g. `GOLD-ABCD1234`, generated at signup |
| `referred_by` | uuid | → `users.id` of the referrer (nullable) |
| `status` | text | |
| `last_login_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |
| `goldtrade_seq` | int | sequential number behind the public **GT‑00001** ID |

---

## admins

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `email` | text | login |
| `password_hash` | text | bcrypt |
| `full_name` | text | |
| `permission_level` | text | |
| `notify_withdrawals` | bool | |
| `notify_signups` | bool | |
| `last_login_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

Admins are inserted directly into this table — there is no admin signup flow.

---

## portfolios (1:1 with a user)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id` (**CASCADE**) |
| `cash_balance` | numeric | spendable/withdrawable money |
| `principal_balance` | numeric | earns 1% daily |
| `version` | bigint | optimistic locking |
| `created_at` / `updated_at` | timestamptz | |

---

## transactions (the ledger)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `portfolio_id` | uuid | → `portfolios.id` (**CASCADE**) |
| `type` | text | `deposit`, `withdrawal`, `daily_profit`, `referral_bonus`, `admin_credit` |
| `description` | text | human‑readable line |
| `amount` | numeric | |
| `occurred_at` | timestamptz | |

Daily‑profit idempotency is enforced by checking for an existing `daily_profit`
transaction dated today for a portfolio.

---

## deposit_requests

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id` |
| `amount` | numeric | **null until an admin approves** with the confirmed amount |
| `payment_method` | text | `binance` (deposits are Binance USDT only) |
| `transaction_reference` | text | optional TXID the investor supplied |
| `status` | text | `pending`, `approved`, `rejected` |
| `reviewed_by` | uuid | admin who acted |
| `reviewed_at` / `requested_at` | timestamptz | |
| `bank_name`, `account_title`, `account_number`, `sender_whatsapp`, `admin_whatsapp_number` | text | legacy/optional fields kept for historical records |

---

## withdraw_requests

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id` (**CASCADE**) |
| `amount` | numeric | |
| `method` | text | `jazzcash` or `binance` (constraint also allows legacy `bank_transfer`, `wire`) |
| `bank_name` | text | display label, e.g. "JazzCash" / "Binance USDT" |
| `account_number` | text | payout destination (JazzCash number or Binance address) |
| `account_title` | text | for legacy bank records |
| `status` | text | `pending`, `approved`, `rejected` |
| `reviewed_by` | uuid | admin who acted |
| `reviewed_at` / `requested_at` | timestamptz | |

---

## referral_earnings

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `referrer_id` | uuid | → `users.id` (who earns) |
| `referred_user_id` | uuid | → `users.id` (who deposited) |
| `deposit_request_id` | uuid | → `deposit_requests.id` |
| `deposit_amount` | numeric | the approved deposit |
| `commission_amount` | numeric | 5% of the deposit |
| `created_at` | timestamptz | |

One row is created each time a referred user's deposit is approved.

---

## notifications

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `recipient_id` | uuid | user or admin id |
| `recipient_role` | text | `investor` / `admin` |
| `type` | text | e.g. `deposit_approved`, `referral_bonus`, `new_deposit_request` |
| `title`, `message`, `link`, `section` | text | |
| `is_read` | bool | |
| `created_at` | timestamptz | |

---

## treasury (single row)

| Column | Type | Notes |
|--------|------|-------|
| `id` | text | always `"main"` |
| `balance` | numeric | platform funds available for admin transfers |
| `version` | bigint | optimistic locking |
| `updated_at` | timestamptz | |

---

## gold_price_history (one row per calendar day)

| Column | Type | Notes |
|--------|------|-------|
| `price_date` | date | PK — one price per day |
| `price` | numeric | USD per tola (24K) |
| `updated_at` | timestamptz | |

Auto‑generated (bounded random walk, default seed $1500) if an admin doesn't set the
day's price; gaps are back‑filled so the 30‑day chart is always complete.

---

## app_settings (key/value config)

| Column | Type | Notes |
|--------|------|-------|
| `key` | text | PK |
| `value` | text | |
| `updated_at` | timestamptz | |

Keys the app reads:
- `deposit_whatsapp_number` — shown on the deposit flow
- `binance_address`, `binance_network` — deposit payment details

(If a key is missing the backend falls back to a sensible default constant.)

---

## refresh_tokens

Stores hashed refresh tokens with `user_id` **or** `admin_id`, `token_hash`,
`expires_at`, `revoked`, `created_at`. Used to mint new access tokens without
re‑login. Investor rows cascade‑delete with the user.

## password_reset_tokens

Short‑lived reset tokens linked to `user_id` **or** `admin_id` (**CASCADE**), with
`token`, `expires_at`, `created_at`.

---

## Entity‑relationship summary

```
users 1───1 portfolios 1───* transactions
  │                                  ▲
  │ referred_by (self‑ref)           │ admin_credit / deposit / profit / bonus
  │
  ├───* deposit_requests ───* referral_earnings *─── users (referrer)
  ├───* withdraw_requests
  ├───* notifications
  ├───* refresh_tokens
  └───* password_reset_tokens

admins ───* (reviews) deposit_requests / withdraw_requests
treasury (single row)      gold_price_history (per day)      app_settings (key/value)
```
