"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import type { InvestorSummary } from "@/types/domain";
import { TableSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface TreasuryBalance {
  balance: number;
}

export default function AdminInvestorsPage() {
  const queryClient = useQueryClient();
  const { data: investors, isLoading } = useQuery({
    queryKey: ["admin", "investors"],
    queryFn: () => api.get<InvestorSummary[]>("/api/admin/investors"),
  });
  const { data: treasury } = useQuery({
    queryKey: ["admin", "treasury"],
    queryFn: () => api.get<TreasuryBalance>("/api/admin/treasury"),
  });

  const [transferTarget, setTransferTarget] = useState<InvestorSummary | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);

  const approve = async (id: string) => {
    setReviewingKey(`${id}:approve`);
    try {
      await api.post(`/api/admin/investors/${id}/approve`);
      toast.success("Investor approved");
      queryClient.invalidateQueries({ queryKey: ["admin", "investors"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewingKey(null);
    }
  };

  const reject = async (id: string) => {
    setReviewingKey(`${id}:reject`);
    try {
      await api.post(`/api/admin/investors/${id}/reject`, { reason: "Did not meet membership criteria" });
      toast.success("Investor rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "investors"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewingKey(null);
    }
  };

  const closeTransfer = () => {
    setTransferTarget(null);
    setAmount("");
  };

  const submitTransfer = async () => {
    if (!transferTarget) return;
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await api.post<{ balance: number }>("/api/admin/treasury/transfer", {
        investor_id: transferTarget.id,
        amount: value,
      });
      toast.success(
        `${formatCurrency(value)} transferred to ${transferTarget.full_name || transferTarget.email}`
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "investors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "treasury"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      closeTransfer();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !investors) {
    return <TableSkeleton rows={6} cols={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="hairline-border gold-glow rounded-xl bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Treasury Balance</p>
        <p className="font-serif-display mt-2 text-2xl text-primary">
          {treasury ? formatCurrency(treasury.balance) : "..."}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Available to transfer directly into investor accounts
        </p>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Investors</h2>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">GoldTrade ID</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Portfolio Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investors.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <Link href={`/admin/investors/${inv.id}`} className="text-foreground hover:text-primary">
                    {inv.full_name || "N/A"}
                  </Link>
                  <p className="text-xs text-muted-foreground md:hidden">
                    {inv.goldtrade_id ?? inv.email}
                  </p>
                </TableCell>
                <TableCell className="hidden font-mono text-muted-foreground md:table-cell">
                  {inv.goldtrade_id ?? "N/A"}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{inv.email}</TableCell>
                <TableCell>
                  {!inv.email_verified ? (
                    <Badge variant="secondary">Unverified</Badge>
                  ) : inv.is_approved ? (
                    <Badge className="bg-primary text-primary-foreground">Approved</Badge>
                  ) : (
                    <Badge className="bg-secondary text-secondary-foreground">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden font-serif-display text-right text-foreground sm:table-cell">
                  {formatCurrency(inv.portfolio_total_value)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {!inv.is_approved && inv.email_verified && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approve(inv.id)}
                          loading={reviewingKey === `${inv.id}:approve`}
                          disabled={reviewingKey !== null && reviewingKey !== `${inv.id}:approve`}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(inv.id)}
                          loading={reviewingKey === `${inv.id}:reject`}
                          disabled={reviewingKey !== null && reviewingKey !== `${inv.id}:reject`}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTransferTarget(inv)}
                      disabled={reviewingKey !== null}
                    >
                      Transfer Funds
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!transferTarget} onOpenChange={(v) => (v ? null : closeTransfer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>
              Send treasury funds directly to {transferTarget?.full_name || transferTarget?.email}&apos;s
              account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer_amount">Amount (USD)</Label>
              <Input
                id="transfer_amount"
                type="number"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Treasury balance: {treasury ? formatCurrency(treasury.balance) : "..."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeTransfer}>
              Cancel
            </Button>
            <Button onClick={submitTransfer} loading={submitting}>
              {submitting ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
