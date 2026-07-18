"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import type { PortfolioOverview } from "@/types/domain";
import { useMarkSectionRead } from "@/lib/use-mark-section-read";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/skeletons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PayoutMethod = "jazzcash" | "binance";

interface WithdrawRequestRow {
  id: string;
  amount: number;
  method: PayoutMethod;
  bank_name: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

const STATUS_BADGE: Record<WithdrawRequestRow["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const METHOD_LABEL: Record<PayoutMethod, string> = {
  jazzcash: "JazzCash",
  binance: "Binance USDT",
};

const emptyForm = {
  method: "jazzcash" as PayoutMethod,
  amount: "",
  accountNumber: "",
};

export default function WithdrawPage() {
  useMarkSectionRead("withdraw");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: portfolio,
    isLoading: loadingPortfolio,
    refetch: refetchPortfolio,
  } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<PortfolioOverview>("/api/portfolio"),
    refetchInterval: 10_000,
  });
  const {
    data: history,
    isLoading: loadingHistory,
    isFetching: fetchingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["portfolio", "withdrawals"],
    queryFn: () => api.get<WithdrawRequestRow[]>("/api/portfolio/withdrawals"),
    refetchInterval: 10_000,
  });

  const refresh = () => {
    refetchPortfolio();
    refetchHistory();
  };

  const available = portfolio?.cash_balance ?? 0;
  const pending = history?.filter((r) => r.status === "pending") ?? [];
  const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
  const totalWithdrawn = history
    ?.filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0) ?? 0;

  const closeDialog = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const submit = async () => {
    const value = parseFloat(form.amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (value > available) {
      toast.error("Amount exceeds your available cash balance");
      return;
    }

    if (!form.accountNumber.trim()) {
      toast.error(
        form.method === "jazzcash" ? "Enter your JazzCash number" : "Enter your Binance address"
      );
      return;
    }

    const payload: Record<string, unknown> = {
      amount: value,
      method: form.method,
      account_number: form.accountNumber,
    };

    setSubmitting(true);
    try {
      await api.post("/api/portfolio/withdrawals", payload);
      toast.success("Withdrawal request submitted for review");
      queryClient.invalidateQueries({ queryKey: ["portfolio", "withdrawals"] });
      closeDialog();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Headline stats */}
      {loadingPortfolio ? (
        <div className="grid gap-6 md:grid-cols-3">
          <StatCardSkeleton big />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="hairline-border gold-glow rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Cash</p>
            <p className="font-serif-display mt-2 text-3xl text-primary">
              {formatCurrency(available)}
            </p>
          </div>
          <div className="hairline-border rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Pending</p>
            <p className="font-serif-display mt-2 text-2xl text-foreground">
              {formatCurrency(pendingAmount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pending.length} request{pending.length === 1 ? "" : "s"} awaiting review
            </p>
          </div>
          <div className="hairline-border rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Withdrawn</p>
            <p className="font-serif-display mt-2 text-2xl text-foreground">
              {formatCurrency(totalWithdrawn)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Lifetime, approved requests</p>
          </div>
        </div>
      )}

      {/* History + action */}
      <div className="hairline-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Withdrawal History
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={refresh} aria-label="Refresh">
              <RefreshCw className={fetchingHistory ? "size-4 animate-spin" : "size-4"} />
            </Button>
            <Button onClick={() => setOpen(true)}>Request a Withdrawal</Button>
          </div>
        </div>

        {loadingHistory || !history ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No withdrawal requests yet.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Bank / Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(r.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{r.bank_name}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[r.status]}>{r.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="font-serif-display text-right text-foreground">
                    {formatCurrency(r.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Withdrawal</DialogTitle>
            <DialogDescription>
              Withdrawal requests are reviewed by our team and typically settle within 1–2
              business days.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Payout Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["jazzcash", "binance"] as PayoutMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, method: m }))}
                    className={`hairline-border rounded-lg p-3 text-left text-xs transition-colors ${
                      form.method === m ? "border-primary bg-secondary/40" : "bg-card"
                    }`}
                  >
                    <p className="font-medium text-foreground">{METHOD_LABEL[m]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">
                {form.method === "jazzcash" ? "JazzCash Number" : "Binance Address (TRX network)"}
              </Label>
              <Input
                id="account_number"
                placeholder={form.method === "jazzcash" ? "03xx xxxxxxx" : "T..."}
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className={form.method === "binance" ? "font-mono" : undefined}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Funds are sent to the account details above once approved.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full sm:w-auto" onClick={submit} loading={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
