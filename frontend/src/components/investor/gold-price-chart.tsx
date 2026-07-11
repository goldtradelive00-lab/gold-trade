"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const GOLD = "#ecc246";
const LIVE_POLL_MS = 30_000; // cheap poll against our own backend, which caches the real GoldAPI call server-side
const HISTORY_DAYS = 30;

interface GoldPriceResponse {
  price_per_tola: number;
  price_per_gram_24k: number;
  fetched_at: string;
  live: boolean;
}

interface GoldHistoryRow {
  date: string; // YYYY-MM-DD
  price_per_tola: number;
  price_per_gram_24k: number;
}

interface PricePoint {
  date: string;
  price: number;
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: PricePoint }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="hairline-border rounded-md bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{formatDateLabel(payload[0].payload.date)} · Per tola (24K)</p>
      <p className="font-serif-display mt-0.5 text-primary">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function GoldPriceChart() {
  const [todayPoint, setTodayPoint] = useState<PricePoint | null>(null);

  const { data: live, isError: liveError } = useQuery({
    queryKey: ["market", "gold"],
    queryFn: () => api.get<GoldPriceResponse>("/api/market/gold"),
    refetchInterval: LIVE_POLL_MS,
  });

  const { data: history, isLoading: historyLoading, isError: historyError } = useQuery({
    queryKey: ["market", "gold", "history"],
    queryFn: () => api.get<GoldHistoryRow[]>(`/api/market/gold/history?days=${HISTORY_DAYS}`),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!live) return;
    const todayDate = new Date(live.fetched_at).toISOString().slice(0, 10);
    setTodayPoint({ date: todayDate, price: live.price_per_tola });
  }, [live]);

  const chartData = useMemo<PricePoint[]>(() => {
    const points: PricePoint[] = (history ?? []).map((h) => ({ date: h.date, price: h.price_per_tola }));
    if (todayPoint) {
      const withoutToday = points.filter((p) => p.date !== todayPoint.date);
      return [...withoutToday, todayPoint];
    }
    return points;
  }, [history, todayPoint]);

  const domain = useMemo<[number, number]>(() => {
    if (chartData.length === 0) return [0, 1];
    const values = chartData.map((d) => d.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(1, (max - min) * 0.15 || max * 0.002);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  if (historyLoading || chartData.length === 0) {
    return (
      <div className="hairline-border gold-glow rounded-xl bg-card p-6">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
          Gold Rate — Pakistan · 24K / Tola
        </h2>
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  if (historyError && liveError) {
    return (
      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
          Gold Rate — Pakistan · 24K / Tola
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Live gold rate is temporarily unavailable. Please try again shortly.
        </p>
      </div>
    );
  }

  const current = chartData[chartData.length - 1].price;
  const openPrice = chartData[0].price;
  const change = current - openPrice;
  const changePct = (change / openPrice) * 100;
  const isUp = change >= 0;
  const isLive = live?.live ?? true;

  return (
    <div className="hairline-border gold-glow rounded-xl bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              {isLive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              )}
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Gold Rate — Pakistan · 24K / Tola
            </h2>
          </div>
          <p className="font-serif-display mt-3 text-3xl text-primary">
            {formatCurrency(current)}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
            isUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}
        >
          {isUp ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {isUp ? "+" : ""}
          {formatCurrency(change)} ({isUp ? "+" : ""}
          {changePct.toFixed(2)}% · {HISTORY_DAYS}d)
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis domain={domain} hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeOpacity: 0.2 }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#goldFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Daily rate history from GoldAPI · Today {isLive ? "live" : "last known"} · Per gram:{" "}
        {formatCurrency(live?.price_per_gram_24k ?? current / 11.6638)}
      </p>
    </div>
  );
}
