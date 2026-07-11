"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PortfolioOverview, Transaction } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoldPriceChart } from "@/components/investor/gold-price-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TX_BADGE: Record<string, string> = {
  buy: "bg-secondary text-secondary-foreground",
  sell: "bg-destructive text-destructive-foreground",
  deposit: "bg-primary text-primary-foreground",
  withdrawal: "bg-secondary text-secondary-foreground",
  dividend: "bg-secondary text-secondary-foreground",
};

export default function InvestorDashboardPage() {
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
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
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
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Cash Balance</p>
            <p className="mt-1 text-foreground">{formatCurrency(portfolio.cash_balance)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Holdings Value</p>
            <p className="mt-1 text-foreground">{formatCurrency(portfolio.holdings_value)}</p>
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
                    <Badge className={TX_BADGE[tx.type]}>{tx.type.toUpperCase()}</Badge>
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
