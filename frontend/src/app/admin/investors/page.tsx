"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import type { InvestorSummary } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminInvestorsPage() {
  const queryClient = useQueryClient();
  const { data: investors, isLoading } = useQuery({
    queryKey: ["admin", "investors"],
    queryFn: () => api.get<InvestorSummary[]>("/api/admin/investors"),
  });

  const approve = async (id: string) => {
    try {
      await api.post(`/api/admin/investors/${id}/approve`);
      toast.success("Investor approved");
      queryClient.invalidateQueries({ queryKey: ["admin", "investors"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const reject = async (id: string) => {
    try {
      await api.post(`/api/admin/investors/${id}/reject`, { reason: "Did not meet membership criteria" });
      toast.success("Investor rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "investors"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading || !investors) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="hairline-border rounded-xl bg-card p-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Investors</h2>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Portfolio Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>
                <Link href={`/admin/investors/${inv.id}`} className="text-foreground hover:text-primary">
                  {inv.full_name || "—"}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{inv.email}</TableCell>
              <TableCell>
                {!inv.email_verified ? (
                  <Badge variant="secondary">Unverified</Badge>
                ) : inv.is_approved ? (
                  <Badge className="bg-primary text-primary-foreground">Approved</Badge>
                ) : (
                  <Badge className="bg-secondary text-secondary-foreground">Pending</Badge>
                )}
              </TableCell>
              <TableCell className="font-serif-display text-right text-foreground">
                {formatCurrency(inv.portfolio_total_value)}
              </TableCell>
              <TableCell className="text-right">
                {!inv.is_approved && inv.email_verified && (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => approve(inv.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(inv.id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
