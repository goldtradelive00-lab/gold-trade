# GoldTrade Documentation

GoldTrade is a gold‑branded savings platform for private clients. Members deposit
funds, earn a fixed **1% daily profit** on their deposited principal, and earn a
**5% referral bonus** whenever someone they invited makes an approved deposit.
Every deposit and withdrawal is manually reviewed by an admin before money moves.

- **Live app:** https://goldtrade.markets
- **API:** https://api.goldtrade.markets
- **Currency:** US Dollars (USD, `$`)
- **Gold rate shown:** USD per **tola** (24K), set daily by the GoldTrade team

---

## Documentation index

| Doc | Who it's for | What it covers |
|-----|--------------|----------------|
| [Investor Manual](./investor-manual.md) | Members / customers | How to sign up, deposit, earn, refer, and withdraw |
| [Admin Manual](./admin-manual.md) | GoldTrade staff | Running the back office: approvals, investors, treasury, settings |
| [Architecture](./architecture.md) | Developers | Stack, structure, and how the pieces fit together |
| [API Reference](./api-reference.md) | Developers | Every backend endpoint, with auth requirements |
| [Database Schema](./database-schema.md) | Developers | All tables, key columns, and relationships |
| [Development Setup](./development-setup.md) | Developers | Running the project locally |
| [Deployment](./deployment.md) | Developers / ops | Shipping to Vercel + Railway |

> A shorter project quick‑start lives in the repo root [`README.md`](../README.md),
> and infrastructure notes in [`DEPLOYMENT.md`](../DEPLOYMENT.md). This `docs/`
> folder is the complete reference and user manual.

---

## Core concepts at a glance

### Two kinds of accounts

- **Investors** — regular members. They sign up themselves, verify their email,
  and (once approved) get a dashboard to deposit, track profit, refer friends,
  and request withdrawals.
- **Admins** — GoldTrade staff. They log in to a back office to approve deposits
  and withdrawals, manage investors, move treasury funds, and configure platform
  settings. Admins are created directly in the database, never through signup.

### GoldTrade ID

Every investor gets a sequential public identifier like **`GT-00001`**,
**`GT-00002`**, … assigned at signup. It's shown on the investor's Settings page,
in the account‑menu dropdown, and next to their name throughout the admin panel.
It's a friendly reference number — not a secret.

### The money model

| Balance | What it is |
|---------|------------|
| **Cash balance** | Spendable money. Deposits, daily profit, and referral bonuses all land here. Withdrawals come out of here. |
| **Principal balance** | The deposited amount that *earns* the 1% daily profit. It grows only when a deposit is approved (or an admin transfers treasury funds); daily profit and referral bonuses do **not** add to it. |

**1% Daily Profit** — Once a day, every investor is credited `1% × principal_balance`
to their **cash balance**. This is simple (non‑compounding) interest: the 1% is
always calculated from the principal, which only moves when a new deposit is
approved. Runs automatically at midnight (server time), and once more at server
startup as a catch‑up. It can only credit each investor **once per calendar day**.

**5% Referral Bonus** — When a referred member's deposit is approved, their
referrer is automatically credited `5% × deposit_amount` to their **cash balance**.
There's no limit to how many people you can refer.

### The deposit flow (why it's manual)

GoldTrade does not auto‑detect payments. Instead:

1. The investor pays via **Binance USDT** to the address shown on the deposit page.
2. They send a screenshot of the receipt to GoldTrade over **WhatsApp**.
3. They submit a deposit **request** in the app (no amount — just the payment method
   and an optional transaction reference).
4. An **admin** matches the WhatsApp receipt to the request, enters the confirmed
   amount, and approves it. Only then is the money credited.

This "human in the loop" is intentional: every dollar is verified before it's booked.

### Deposits vs. withdrawals — payment methods

| | Deposit | Withdrawal |
|--|---------|------------|
| **Binance USDT** | ✅ (the only deposit method) | ✅ |
| **JazzCash** | ❌ | ✅ |

Historical records made before these rules changed still display correctly.

---

## Standard test / admin credentials

The seeded admin account (development and demo):

- **Email:** `administrator@goldtrade.com`
- **Password:** `abdullah@2026`

Investor test accounts are created on demand through the normal signup flow.
