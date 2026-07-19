# Admin Manual — Running the GoldTrade Back Office

This is the operations guide for GoldTrade staff. As an admin you approve the money
that flows in and out, manage investor accounts, move treasury funds, and configure
what members see.

> Admin accounts are created directly in the database — there is no admin signup.
> The default admin is `administrator@goldtrade.com`.

---

## 1. Logging in

1. Go to **`/login`** and sign in with your admin email and password.
2. You'll be taken to the **Admin Console**. The sidebar links to: **Dashboard,
   Finance, Deposit Requests, Withdraw Requests, Investors, Settings**.

The top‑right has the 🔔 notification bell (you're alerted to every new deposit and
withdrawal request) and your account menu.

---

## 2. Dashboard (`/admin/overview`)

Four headline numbers:

- **Total AUM** — assets under management (sum of all investor cash balances).
- **Treasury Balance** — funds available for you to transfer directly to investors.
- **Total Investors** — number of investor accounts.
- **Requests Pending** — deposit + withdrawal requests waiting for review.

---

## 3. Finance (`/admin/finance`)

A platform‑wide view of money movement:

- **Total AUM** — cash balances across every investor.
- **Money In** — deposits + referral bonuses + daily profit.
- **Money Out** — withdrawals.
- **Cash Flow Breakdown** — the components:
  - Deposits
  - Referral Bonuses
  - Daily Profits (1%)
  - Withdrawals
  - **Net Flow** = deposits + bonuses + profit − withdrawals

Use this to see the health of the platform at a glance.

---

## 4. Deposit Requests (`/admin/deposit-requests`)

This is where money enters the platform. Requests are grouped into **Pending**,
**Approved**, and **Rejected** tabs.

### Reviewing a request

Each row shows the investor (name + GoldTrade ID + email), the payment method
(**Binance USDT**), the date, and the status.

- **View** — opens a dialog with full details: investor, GoldTrade ID, email, phone,
  the amount (once set), payment method, transaction reference, and timestamps.

### Approving a deposit ⚠️ (this moves money)

1. Confirm the payment first: match the investor's **WhatsApp receipt screenshot** to
   the request (check the transaction reference if provided).
2. Click **Approve**.
3. In the **Approve Deposit** dialog, type the **exact amount** you confirmed from the
   receipt, then click **Confirm & Credit**.

When you approve:

- The amount is added to the investor's **cash balance and principal balance** (their
  principal now earns 1% daily).
- If the investor was **referred**, the referrer is automatically credited **5% of the
  deposit** to their cash balance.
- The investor gets a notification.

> The amount is **not** pre‑filled — you set it, so the booked amount always matches
> the real receipt. Enter it carefully; approval is not reversible from the UI.

### Rejecting a deposit

Click **Reject** if a receipt is missing, wrong, or fraudulent. The investor is
notified and can submit a new request. No money moves.

---

## 5. Withdraw Requests (`/admin/withdrawals`)

Where money leaves the platform. Same **Pending / Approved / Rejected** tabs.

Each row shows the investor, their payout destination (**JazzCash** or **Binance
USDT**), the date, status, and amount.

- **View** — full details including the exact payout account/number the investor gave
  you (e.g. JazzCash number or Binance address). **Send the funds to this destination
  manually.**
- **Approve** — after you've sent the payout, approve to deduct the amount from the
  investor's cash balance and mark it settled.
- **Reject** — declines the request; no money moves.

> The platform does **not** send payouts automatically. Approving records the payout
> and adjusts the balance — you do the actual transfer through JazzCash / Binance.

---

## 6. Investors (`/admin/investors`)

At the top you'll see the **Treasury Balance**. Below is the full investor list with
**Name + GoldTrade ID**, **Status**, **Portfolio Value**, and actions.

**Status** can be:
- **Approved** — verified and active.
- **Pending** — verified email but awaiting approval.
- **Unverified** — hasn't clicked the email verification link yet.

### Actions per investor

- **Approve / Reject** — appears for accounts that are verified but not yet approved.
  (In normal flow, clicking the email verification link auto‑approves, so you rarely
  need this — it's there for manual control.)
- **Transfer Funds** — see below.
- Clicking a name opens the **investor detail page** (`/admin/investors/[id]`) showing
  Portfolio Value, KYC Status, Phone, Member Since, and their full transaction history.

### Transfer Funds (treasury → investor)

Use this to credit an investor directly from the platform treasury — e.g. a manual
top‑up or correction, outside the normal deposit flow.

1. Click **Transfer Funds** on the investor's row.
2. Enter the **Amount (USD)** (must not exceed the treasury balance).
3. Click **Transfer**.

This behaves like a manually‑credited deposit: it adds to the investor's **cash and
principal** balance (so it starts earning 1% daily), reduces the treasury, logs an
`admin_credit` transaction, and notifies the investor.

---

## 7. Settings (`/admin/settings`)

Four sections:

### Profile & Security
- Your full name and (read‑only) email.
- **Change Password** — update your admin password.

### Deposit Receipts
- **WhatsApp Number** — the number investors are told to send deposit receipts to.
  Update it and click **Save Changes**. This is what shows on the investor deposit
  flow (Step 2).

### Payment Methods
- **Binance Network** (e.g. `TRX (TRC20)`) and **Binance Address / ID** — the deposit
  details investors pay to. Update and **Save Changes**. (Binance USDT is the only
  deposit method.)

### Today's Gold Price
- **Gold Price (USD / Tola)** — sets today's 24K gold rate shown on both the public
  landing page and every investor dashboard chart. Once set, it's stored and shown
  everywhere until you change it again.
- If you never set it, the system auto‑generates a believable value each day (a small
  random walk around the last known price), so the chart is never empty.

---

## 8. Notifications

The 🔔 bell alerts you to every new deposit and withdrawal request (and other events),
so you can act quickly. Opening it marks items read; **Clear all** empties it
instantly; the **✕** closes the panel.

---

## Daily operations checklist

A typical day:

1. **Check the bell / Dashboard** for pending requests.
2. **Deposit Requests → Pending:** for each, match the WhatsApp receipt, then
   **Approve** with the exact amount (or **Reject**).
3. **Withdraw Requests → Pending:** send each payout via JazzCash/Binance, then
   **Approve** (or **Reject**).
4. **Investors:** approve any accounts awaiting manual approval; use **Transfer Funds**
   for any corrections.
5. **Settings:** update **Today's Gold Price** if you want to set an exact rate;
   update WhatsApp/Binance details if they change.

Daily 1% profit is credited **automatically** — you don't need to trigger it. (A
manual trigger endpoint exists for engineers; see the [API Reference](./api-reference.md).)

---

## Things to be careful about

- **Approving a deposit is not reversible from the UI** and instantly credits the
  investor (and pays any referral bonus). Double‑check the amount against the receipt.
- **Approving a withdrawal assumes you've already sent the payout.** The system only
  records it and adjusts the balance.
- **Transfer Funds spends real treasury balance.** It can't exceed the treasury total.
- Deleting/mass‑resetting data is a database‑level operation, not something the admin
  UI exposes — do it deliberately.
