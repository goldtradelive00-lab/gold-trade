"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import type { PortfolioOverview } from "@/types/domain";
import { PAKISTAN_BANKS } from "@/lib/pakistan-banks";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WithdrawRequestRow {
  id: string;
  amount: number;
  bank_name: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

const STATUS_BADGE: Record<WithdrawRequestRow["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const emptyForm = { amount: "", bank: "", otherBank: "", accountTitle: "", accountNumber: "" };

export default function WithdrawPage() {
  useMarkSectionRead("withdraw");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<PortfolioOverview>("/api/portfolio"),
  });
  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["portfolio", "withdrawals"],
    queryFn: () => api.get<WithdrawRequestRow[]>("/api/portfolio/withdrawals"),
  });

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
    if (!form.bank) {
      toast.error("Select a bank or wallet");
      return;
    }
    if (form.bank === "Other" && !form.otherBank.trim()) {
      toast.error("Enter the name of your bank or wallet");
      return;
    }
    if (!form.accountTitle.trim()) {
      toast.error("Enter the account title");
      return;
    }
    if (!form.accountNumber.trim()) {
      toast.error("Enter the account number or IBAN");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/portfolio/withdrawals", {
        amount: value,
        bank_name: form.bank === "Other" ? form.otherBank.trim() : form.bank,
        account_title: form.accountTitle,
        account_number: form.accountNumber,
      });
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
          <Button onClick={() => setOpen(true)}>Request a Withdrawal</Button>
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
                <TableHead>Bank / Wallet</TableHead>
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
                  <TableCell className="text-muted-foreground">{r.bank_name}</TableCell>
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
              <Label htmlFor="amount">Amount (PKR)</Label>
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
              <Label>Bank / Wallet</Label>
              <Select value={form.bank} onValueChange={(v) => setForm((f) => ({ ...f, bank: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select the bank or wallet to receive funds" />
                </SelectTrigger>
                <SelectContent>
                  {PAKISTAN_BANKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.bank === "Other" && (
                <Input
                  className="mt-2"
                  placeholder="Enter the name of your bank or wallet"
                  value={form.otherBank}
                  onChange={(e) => setForm((f) => ({ ...f, otherBank: e.target.value }))}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_title">Account Title</Label>
              <Input
                id="account_title"
                placeholder="Name on the account"
                value={form.accountTitle}
                onChange={(e) => setForm((f) => ({ ...f, accountTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number / IBAN</Label>
              <Input
                id="account_number"
                placeholder="e.g. PK00XXXX0000000000000000 or wallet number"
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Funds are sent to the account details above once approved.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full sm:w-auto" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
