"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  amount: number;
  method: string;
  requested_at: string;
  status: RequestStatus;
}

const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export default function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: () => api.get<WithdrawRequestRow[]>("/api/admin/withdrawals"),
  });

  const review = async (id: string, action: "approve" | "reject") => {
    try {
      await api.post(`/api/admin/withdrawals/${id}/${action}`);
      toast.success(action === "approve" ? "Withdrawal approved" : "Withdrawal rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading || !requests) {
    return <Skeleton className="h-64 w-full" />;
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="hairline-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Withdraw Requests
          </h2>
          <Badge className="bg-secondary text-secondary-foreground">{pendingCount} pending</Badge>
        </div>

        {requests.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No withdrawal requests yet.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="text-foreground">{r.customer}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.method.replace("_", " ")}
                  </TableCell>
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
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => review(r.id, "approve")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => review(r.id, "reject")}>
                          Reject
                        </Button>
                      </div>
                    )}
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
