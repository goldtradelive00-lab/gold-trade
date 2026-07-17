"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { InvestorDetail } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminInvestorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: investor, isLoading } = useQuery({
    queryKey: ["admin", "investors", id],
    queryFn: () => api.get<InvestorDetail>(`/api/admin/investors/${id}`),
  });

  if (isLoading || !investor) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="hairline-border rounded-xl bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-7 w-40" />
              <Skeleton className="mt-2 h-4 w-52" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Investors
      </button>

      <div className="hairline-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif-display text-2xl text-foreground">{investor.full_name || "N/A"}</h1>
            <p className="text-sm text-muted-foreground">
              {investor.goldtrade_id && (
                <span className="font-mono text-primary">{investor.goldtrade_id}</span>
              )}
              {investor.goldtrade_id && " · "}
              {investor.email}
            </p>
          </div>
          {investor.is_approved ? (
            <Badge className="bg-primary text-primary-foreground">Approved</Badge>
          ) : (
            <Badge className="bg-secondary text-secondary-foreground">Pending</Badge>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
          <Stat label="Portfolio Value" value={formatCurrency(investor.portfolio_total_value)} />
          <Stat label="KYC Status" value={investor.kyc_status} />
          <Stat label="Phone" value={investor.phone_number || "N/A"} />
          <Stat label="Member Since" value={new Date(investor.created_at).toLocaleDateString()} />
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Transactions</h2>
        {!investor.transactions || investor.transactions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No transactions.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investor.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(tx.occurred_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="whitespace-normal">{tx.description}</TableCell>
                  <TableCell className="hidden sm:table-cell">{tx.type}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}
