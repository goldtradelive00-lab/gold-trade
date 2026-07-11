"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import type { PortfolioOverview, Transaction } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

const QUICK_AMOUNTS = [1000, 5000, 25000, 100000];

export default function DepositPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [submitting, setSubmitting] = useState(false);

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<PortfolioOverview>("/api/portfolio"),
  });
  const { data: transactions, isLoading: loadingHistory } = useQuery({
    queryKey: ["portfolio", "transactions"],
    queryFn: () => api.get<Transaction[]>("/api/portfolio/transactions"),
  });
  const deposits = transactions?.filter((t) => t.type === "deposit") ?? [];
  const totalDeposited = deposits.reduce((sum, t) => sum + t.amount, 0);

  const submit = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/portfolio/deposits", { amount: value, method });
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      setAmount("");
      setOpen(false);
      toast.success("Deposit received");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Headline stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="hairline-border gold-glow rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Cash</p>
          <p className="font-serif-display mt-2 text-3xl text-primary">
            {formatCurrency(portfolio?.cash_balance ?? 0)}
          </p>
        </div>
        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Deposited</p>
          <p className="font-serif-display mt-2 text-2xl text-foreground">
            {formatCurrency(totalDeposited)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Lifetime, all methods</p>
        </div>
      </div>

      {/* History + action */}
      <div className="hairline-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Deposit History
          </h2>
          <Button onClick={() => setOpen(true)}>Deposit Funds</Button>
        </div>

        {loadingHistory || !transactions ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : deposits.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No deposits yet.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(tx.occurred_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                  <TableCell className="font-serif-display text-right text-primary">
                    +{formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              No deposit fees. Bank transfers typically clear within 1–3 business days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className="hairline-border rounded-md px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wire">Wire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full sm:w-auto" onClick={submit} disabled={submitting}>
              {submitting ? "Processing..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
