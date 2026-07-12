"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatCardSkeleton } from "@/components/skeletons";

interface OverviewStats {
  total_investors: number;
  approved_investors: number;
  pending_approvals: number;
  total_aum: number;
  treasury_balance: number;
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => api.get<OverviewStats>("/api/admin/overview"),
  });

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCardSkeleton big />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total AUM" value={formatCurrency(data.total_aum)} />
      <StatCard label="Treasury Balance" value={formatCurrency(data.treasury_balance)} />
      <StatCard label="Total Investors" value={data.total_investors.toString()} />
      <StatCard label="Approved Investors" value={data.approved_investors.toString()} />
      <StatCard
        label="Pending Approvals"
        value={data.pending_approvals.toString()}
        highlight={data.pending_approvals > 0}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="hairline-border rounded-xl bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-serif-display mt-2 text-2xl ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
