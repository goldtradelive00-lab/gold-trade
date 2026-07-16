"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/skeletons";
import { DetailRow } from "@/components/admin/detail-row";
import { useMarkSectionRead } from "@/lib/use-mark-section-read";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type RequestStatus = "pending" | "approved" | "rejected";

interface WithdrawRequestRow {
  id: string;
  customer: string;
  email: string;
  phone_number: string | null;
  amount: number;
  bank_name: string;
  account_title: string;
  account_number: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
  status: RequestStatus;
}

const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export default function AdminWithdrawalsPage() {
  useMarkSectionRead("admin_withdraw");
  const queryClient = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);
  const {
    data: requests,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: () => api.get<WithdrawRequestRow[]>("/api/admin/withdrawals"),
    refetchInterval: 10_000,
  });

  const review = async (id: string, action: "approve" | "reject") => {
    const key = `${id}:${action}`;
    setReviewingKey(key);
    try {
      await api.post(`/api/admin/withdrawals/${id}/${action}`);
      toast.success(action === "approve" ? "Withdrawal approved" : "Withdrawal rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
      setViewingId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewingKey(null);
    }
  };

  if (isLoading || !requests) {
    return <TableSkeleton rows={5} cols={6} />;
  }

  const viewing = requests.find((r) => r.id === viewingId) ?? null;

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const rejected = requests.filter((r) => r.status === "rejected");

  const renderTable = (rows: WithdrawRequestRow[], emptyLabel: string) =>
    rows.length === 0 ? (
      <p className="mt-4 text-sm text-muted-foreground">{emptyLabel}</p>
    ) : (
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Investor</TableHead>
            <TableHead>Bank / Wallet</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <p className="text-foreground">{r.customer}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{r.bank_name}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(r.requested_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge className={STATUS_BADGE[r.status]}>{r.status.toUpperCase()}</Badge>
              </TableCell>
              <TableCell className="font-serif-display text-right text-foreground">
                {formatCurrency(r.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewingId(r.id)}>
                    View
                  </Button>
                  {r.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => review(r.id, "approve")}
                        loading={reviewingKey === `${r.id}:approve`}
                        disabled={reviewingKey !== null && reviewingKey !== `${r.id}:approve`}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => review(r.id, "reject")}
                        loading={reviewingKey === `${r.id}:reject`}
                        disabled={reviewingKey !== null && reviewingKey !== `${r.id}:reject`}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

  return (
    <div className="space-y-6">
      <div className="hairline-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Withdraw Requests
          </h2>
          <Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
          </Button>
        </div>

        <Tabs defaultValue="pending" className="mt-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {renderTable(pending, "No pending withdrawal requests.")}
          </TabsContent>
          <TabsContent value="approved">
            {renderTable(approved, "No approved withdrawal requests yet.")}
          </TabsContent>
          <TabsContent value="rejected">
            {renderTable(rejected, "No rejected withdrawal requests.")}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Request</DialogTitle>
            <DialogDescription>Full submission details for review.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-4">
              <DetailRow label="Investor" value={viewing.customer} />
              <DetailRow label="Email" value={viewing.email} />
              <DetailRow label="Phone" value={viewing.phone_number || "N/A"} />
              <DetailRow
                label="Amount"
                value={<span className="font-serif-display text-primary">{formatCurrency(viewing.amount)}</span>}
              />
              <DetailRow label="Bank / Wallet" value={viewing.bank_name} />
              <DetailRow label="Account Title" value={viewing.account_title} />
              <DetailRow label="Account Number / IBAN" value={viewing.account_number} />
              <DetailRow label="Requested" value={new Date(viewing.requested_at).toLocaleString()} />
              <DetailRow
                label="Status"
                value={<Badge className={STATUS_BADGE[viewing.status]}>{viewing.status.toUpperCase()}</Badge>}
              />
              {viewing.reviewed_at && (
                <>
                  <DetailRow label="Reviewed By" value={viewing.reviewed_by_name || "N/A"} />
                  <DetailRow label="Reviewed At" value={new Date(viewing.reviewed_at).toLocaleString()} />
                </>
              )}
            </div>
          )}
          {viewing?.status === "pending" && (
            <DialogFooter>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => review(viewing.id, "reject")}
                loading={reviewingKey === `${viewing.id}:reject`}
                disabled={reviewingKey !== null && reviewingKey !== `${viewing.id}:reject`}
              >
                Reject
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => review(viewing.id, "approve")}
                loading={reviewingKey === `${viewing.id}:approve`}
                disabled={reviewingKey !== null && reviewingKey !== `${viewing.id}:approve`}
              >
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
