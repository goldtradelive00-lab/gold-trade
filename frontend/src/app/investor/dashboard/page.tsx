"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PortfolioOverview, Transaction } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoldPriceChart } from "@/components/investor/gold-price-chart";
import { useMarkSectionRead } from "@/lib/use-mark-section-read";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TX_BADGE: Record<string, string> = {
  deposit: "bg-primary text-primary-foreground",
  withdrawal: "bg-secondary text-secondary-foreground",
  referral_bonus: "bg-primary text-primary-foreground",
  daily_profit: "bg-primary text-primary-foreground",
  admin_credit: "bg-primary text-primary-foreground",
};

export default function InvestorDashboardPage() {
  useMarkSectionRead("dashboard");
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<PortfolioOverview>("/api/portfolio"),
  });
  const { data: transactions } = useQuery({
    queryKey: ["portfolio", "transactions"],
    queryFn: () => api.get<Transaction[]>("/api/portfolio/transactions"),
  });

  if (isLoading || !portfolio) {
    return (
      <div className="space-y-6">
        <div className="hairline-border rounded-xl bg-card p-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-3 h-9 w-56" />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-5 w-28" />
            </div>
            <div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-2 h-5 w-28" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <div className="hairline-border rounded-xl bg-card p-6">
            <Skeleton className="h-3 w-28" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>

        <TableSkeleton rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hairline-border gold-glow rounded-xl bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Portfolio Value</p>
        <p className="font-serif-display mt-2 text-4xl text-primary">
          {formatCurrency(portfolio.total_value)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Cash Balance</p>
            <p className="mt-1 text-foreground">{formatCurrency(portfolio.cash_balance)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Principal (earns 1% daily)</p>
            <p className="mt-1 text-foreground">{formatCurrency(portfolio.principal_balance)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GoldPriceChart />
        </div>

        <div className="hairline-border rounded-xl bg-card p-6">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Button asChild>
              <Link href="/investor/deposit">Deposit Funds</Link>
            </Button>
            <Button variant="outline" className="border-primary text-primary" asChild>
              <Link href="/investor/withdraw">Withdraw</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Recent Transactions</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(tx.occurred_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    <Badge className={TX_BADGE[tx.type]}>{tx.type.replace("_", " ").toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="font-serif-display text-right text-foreground">
                    {formatCurrency(tx.amount)}
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
