"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FinanceOverview {
  total_deposits: number;
  total_withdrawals: number;
  total_dividends: number;
  total_buys: number;
  total_sells: number;
  total_referral_bonuses: number;
  total_daily_profits: number;
  money_in: number;
  money_out: number;
  net_flow: number;
  total_aum: number;
  total_cash_balance: number;
  total_holdings_value: number;
  pending_withdrawals_amount: number;
  pending_withdrawals_count: number;
  transaction_count: number;
}

interface LedgerRow {
  id: string;
  investor_name: string;
  investor_email: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "dividend" | "referral_bonus" | "daily_profit";
  description: string;
  amount: number;
  occurred_at: string;
}

const TYPE_BADGE: Record<LedgerRow["type"], string> = {
  buy: "bg-secondary text-secondary-foreground",
  sell: "bg-secondary text-secondary-foreground",
  deposit: "bg-primary text-primary-foreground",
  withdrawal: "bg-destructive text-destructive-foreground",
  dividend: "bg-secondary text-secondary-foreground",
  referral_bonus: "bg-primary text-primary-foreground",
  daily_profit: "bg-primary text-primary-foreground",
};

export default function AdminFinancePage() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["admin", "finance", "overview"],
    queryFn: () => api.get<FinanceOverview>("/api/admin/finance/overview"),
  });
  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ["admin", "finance", "transactions"],
    queryFn: () => api.get<LedgerRow[]>("/api/admin/finance/transactions"),
  });

  if (loadingOverview || !overview) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Headline totals */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="hairline-border gold-glow rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total AUM</p>
          <p className="font-serif-display mt-2 text-2xl text-primary">
            {formatCurrency(overview.total_aum)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cash {formatCurrency(overview.total_cash_balance)} · Holdings{" "}
            {formatCurrency(overview.total_holdings_value)}
          </p>
        </div>
        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Money In</p>
          <p className="font-serif-display mt-2 text-2xl text-foreground">
            {formatCurrency(overview.money_in)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Deposits, dividends, sales, referral bonuses &amp; daily profit</p>
        </div>
        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Money Out</p>
          <p className="font-serif-display mt-2 text-2xl text-foreground">
            {formatCurrency(overview.money_out)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Withdrawals &amp; purchases</p>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="hairline-border rounded-xl bg-card p-6">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Cash Flow Breakdown
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Deposits" value={overview.total_deposits} positive />
            <Row label="Dividends" value={overview.total_dividends} positive />
            <Row label="Referral Bonuses" value={overview.total_referral_bonuses} positive />
            <Row label="Daily Profits (1%)" value={overview.total_daily_profits} positive />
            <Row label="Withdrawals" value={overview.total_withdrawals} />
            <Row label="Buys" value={overview.total_buys} />
            <Row label="Sells" value={overview.total_sells} positive />
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-foreground">Net Flow (deposits + dividends + bonuses − withdrawals)</span>
              <span
                className={`font-serif-display ${overview.net_flow >= 0 ? "text-primary" : "text-destructive-foreground"}`}
              >
                {overview.net_flow >= 0 ? "+" : ""}
                {formatCurrency(overview.net_flow)}
              </span>
            </div>
          </div>
        </div>

        <div className="hairline-border rounded-xl bg-card p-6">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Pending Obligations
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Pending Withdrawal Requests" value={overview.pending_withdrawals_count} isCount />
            <Row label="Pending Withdrawal Amount" value={overview.pending_withdrawals_amount} />
            <Row label="Total Recorded Transactions" value={overview.transaction_count} isCount />
          </div>
        </div>
      </div>

      {/* Full ledger */}
      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
          Platform Transaction Ledger
        </h2>
        {loadingLedger || !ledger ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : ledger.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No transactions recorded yet.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="text-foreground">{row.investor_name}</p>
                    <p className="text-xs text-muted-foreground">{row.investor_email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.description}</TableCell>
                  <TableCell>
                    <Badge className={TYPE_BADGE[row.type]}>{row.type.replace("_", " ").toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(row.occurred_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-serif-display text-right text-foreground">
                    {formatCurrency(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  positive,
  isCount,
}: {
  label: string;
  value: number;
  positive?: boolean;
  isCount?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={positive ? "text-primary" : "text-foreground"}>
        {isCount ? value : formatCurrency(value)}
      </span>
    </div>
  );
}
