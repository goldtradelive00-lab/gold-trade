"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Holding } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function HoldingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: holding, isLoading } = useQuery({
    queryKey: ["holding", id],
    queryFn: () => api.get<Holding>(`/api/holdings/${id}`),
  });

  if (isLoading || !holding) {
    return <Skeleton className="h-64 w-full" />;
  }

  const marketValue = holding.current_price * holding.quantity;
  const costBasis = holding.avg_cost * holding.quantity;
  const gainLoss = marketValue - costBasis;
  const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="hairline-border rounded-xl bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{holding.asset_type}</p>
        <h1 className="font-serif-display mt-2 text-2xl text-foreground">{holding.name}</h1>
        <p className="text-sm text-muted-foreground">{holding.symbol}</p>

        <p className="font-serif-display mt-6 text-4xl text-primary">{formatCurrency(marketValue)}</p>
        <p className={gainLoss >= 0 ? "mt-1 text-sm text-primary" : "mt-1 text-sm text-destructive-foreground"}>
          {gainLoss >= 0 ? "+" : ""}
          {formatCurrency(gainLoss)} ({gainLossPct.toFixed(2)}%)
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
          <Stat label="Quantity" value={holding.quantity.toString()} />
          <Stat label="Avg. Cost" value={formatCurrency(holding.avg_cost)} />
          <Stat label="Current Price" value={formatCurrency(holding.current_price)} />
          <Stat label="Cost Basis" value={formatCurrency(costBasis)} />
        </div>
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
