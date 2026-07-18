"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, RefreshCw } from "lucide-react";
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

// "jazzcash" is kept only so historical deposit requests made before JazzCash was removed
// as a deposit option still render a correct label in the history table below.
type PaymentMethod = "jazzcash" | "binance";

interface PaymentMethodSettings {
  binance_address: string;
  binance_network: string;
}

interface DepositRequestRow {
  id: string;
  amount: number | null;
  payment_method: PaymentMethod;
  transaction_reference: string | null;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

const STATUS_BADGE: Record<DepositRequestRow["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  jazzcash: "JazzCash",
  binance: "Binance USDT",
};

const emptyForm = {
  reference: "",
};

export default function DepositPage() {
  useMarkSectionRead("deposit");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
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
    queryKey: ["portfolio", "deposit-requests"],
    queryFn: () => api.get<DepositRequestRow[]>("/api/portfolio/deposit-requests"),
    refetchInterval: 10_000,
  });

  const refresh = () => {
    refetchPortfolio();
    refetchHistory();
  };
  const { data: whatsapp } = useQuery({
    queryKey: ["settings", "deposit-whatsapp"],
    queryFn: () => api.get<{ whatsapp_number: string }>("/api/settings/deposit-whatsapp"),
  });
  const { data: paymentMethods } = useQuery({
    queryKey: ["settings", "payment-methods"],
    queryFn: () => api.get<PaymentMethodSettings>("/api/settings/payment-methods"),
  });

  const totalDeposited = history
    ?.filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0;

  const closeDialog = () => {
    setOpen(false);
    setStep(1);
    setForm(emptyForm);
  };

  const goToStep2 = () => setStep(2);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/api/portfolio/deposit-requests", {
        payment_method: "binance",
        transaction_reference: form.reference.trim() || undefined,
      });
      toast.success("Deposit request submitted. Our team will confirm your receipt shortly.");
      queryClient.invalidateQueries({ queryKey: ["portfolio", "deposit-requests"] });
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
        <div className="grid gap-6 md:grid-cols-2">
          <StatCardSkeleton big />
          <StatCardSkeleton />
        </div>
      ) : (
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
            <p className="mt-1 text-xs text-muted-foreground">Lifetime, approved deposits</p>
          </div>
        </div>
      )}

      {/* History + action */}
      <div className="hairline-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Deposit History
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={refresh} aria-label="Refresh">
              <RefreshCw className={fetchingHistory ? "size-4 animate-spin" : "size-4"} />
            </Button>
            <Button onClick={() => setOpen(true)}>Deposit Funds</Button>
          </div>
        </div>

        {loadingHistory || !history ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No deposit requests yet.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Method</TableHead>
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
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {METHOD_LABEL[r.payment_method]}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[r.status]}>{r.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="font-serif-display text-right text-foreground">
                    {r.amount != null ? formatCurrency(r.amount) : "Pending review"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeDialog())}>
        <DialogContent>
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>Deposit Funds (Step 1 of 2)</DialogTitle>
                <DialogDescription>Pay using Binance USDT.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                <div className="hairline-border rounded-lg bg-secondary/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Network</p>
                  <p className="mt-1 text-sm text-foreground">
                    {paymentMethods?.binance_network ?? "..."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Address</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="break-all font-mono text-sm text-primary">
                      {paymentMethods?.binance_address ?? "..."}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() =>
                        paymentMethods && copy(paymentMethods.binance_address, "Binance address")
                      }
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full sm:w-auto" onClick={goToStep2}>
                  Next
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Deposit Funds (Step 2 of 2)</DialogTitle>
                <DialogDescription>Share your receipt with our team.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                <p className="text-sm text-muted-foreground">
                  Send a screenshot of your payment receipt to our WhatsApp number below. Our
                  team verifies the amount and credits your account.
                </p>
                <div className="hairline-border flex items-center justify-between rounded-lg bg-secondary/40 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      WhatsApp Number
                    </p>
                    <p className="font-serif-display mt-1 text-xl text-primary">
                      {whatsapp?.whatsapp_number ?? "..."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => whatsapp && copy(whatsapp.whatsapp_number, "WhatsApp number")}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Transaction ID / Reference (optional)</Label>
                  <Input
                    id="reference"
                    placeholder="e.g. Binance TXID"
                    value={form.reference}
                    onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Once you submit this request, our team confirms your receipt and credits the
                  amount to your account.
                </p>
              </div>
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="w-full sm:w-auto" onClick={submit} loading={submitting}>
                  {submitting ? "Submitting..." : "Submit Deposit Request"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
