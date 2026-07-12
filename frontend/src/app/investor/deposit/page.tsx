"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy } from "lucide-react";
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

interface DepositRequestRow {
  id: string;
  amount: number;
  bank_name: string;
  account_title: string;
  account_number: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

const STATUS_BADGE: Record<DepositRequestRow["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const emptyForm = {
  amount: "",
  bank: "",
  otherBank: "",
  accountTitle: "",
  accountNumber: "",
  senderWhatsapp: "",
};

export default function DepositPage() {
  useMarkSectionRead("deposit");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<PortfolioOverview>("/api/portfolio"),
  });
  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["portfolio", "deposit-requests"],
    queryFn: () => api.get<DepositRequestRow[]>("/api/portfolio/deposit-requests"),
  });
  const { data: whatsapp } = useQuery({
    queryKey: ["settings", "deposit-whatsapp"],
    queryFn: () => api.get<{ whatsapp_number: string }>("/api/settings/deposit-whatsapp"),
  });

  const totalDeposited = history
    ?.filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0) ?? 0;

  const closeDialog = () => {
    setOpen(false);
    setStep(1);
    setForm(emptyForm);
  };

  const goToStep2 = () => {
    const value = parseFloat(form.amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
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
    setStep(2);
  };

  const copyWhatsapp = async () => {
    if (!whatsapp?.whatsapp_number) return;
    await navigator.clipboard.writeText(whatsapp.whatsapp_number);
    toast.success("WhatsApp number copied");
  };

  const submit = async () => {
    if (!form.senderWhatsapp.trim()) {
      toast.error("Enter the WhatsApp number you used to send the receipt");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/portfolio/deposit-requests", {
        amount: parseFloat(form.amount),
        bank_name: form.bank === "Other" ? form.otherBank.trim() : form.bank,
        account_title: form.accountTitle,
        account_number: form.accountNumber,
        sender_whatsapp: form.senderWhatsapp,
      });
      toast.success("Deposit request submitted. Please allow up to 24 hours for approval.");
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
          <Button onClick={() => setOpen(true)}>Deposit Funds</Button>
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
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>Deposit Funds (Step 1 of 2)</DialogTitle>
                <DialogDescription>Enter the amount and the account you sent it from.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                      <SelectValue placeholder="Select the bank or wallet you sent from" />
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
                <DialogDescription>Attach evidence of your transfer.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send a screenshot of your payment receipt to our WhatsApp number below. Our
                  team verifies and credits deposits within 24 hours.
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
                  <Button variant="outline" size="icon" onClick={copyWhatsapp}>
                    <Copy className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_whatsapp">
                    Your WhatsApp Number (used to send the receipt)
                  </Label>
                  <Input
                    id="sender_whatsapp"
                    type="tel"
                    placeholder="03xx xxxxxxx"
                    value={form.senderWhatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, senderWhatsapp: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Once you submit this request, please allow up to 24 hours for our team to
                  confirm your receipt and approve the deposit.
                </p>
              </div>
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="w-full sm:w-auto" onClick={submit} disabled={submitting}>
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
