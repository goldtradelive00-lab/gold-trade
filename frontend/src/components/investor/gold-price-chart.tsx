"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { generateGoldSeries, type GoldPricePoint } from "@/lib/gold-price";

const GOLD = "#ecc246";
const HISTORY_DAYS = 30;

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: GoldPricePoint }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="hairline-border rounded-md bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{formatDateLabel(payload[0].payload.date)} · Per oz (24K)</p>
      <p className="font-serif-display mt-0.5 text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function GoldPriceChart() {
  const [data, setData] = useState<GoldPricePoint[] | null>(null);

  // Generate on the client after mount to avoid a server/client hydration mismatch
  // from the randomised data.
  useEffect(() => {
    setData(generateGoldSeries(HISTORY_DAYS));
  }, []);

  const chartData = data ?? [];

  const domain = useMemo<[number, number]>(() => {
    if (chartData.length === 0) return [0, 1];
    const values = chartData.map((d) => d.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(1, (max - min) * 0.15 || max * 0.002);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  const current = chartData.length > 0 ? chartData[chartData.length - 1].price : null;
  const openPrice = chartData.length > 0 ? chartData[0].price : current;
  const change = current !== null && openPrice !== null ? current - openPrice : 0;
  const changePct = openPrice ? (change / openPrice) * 100 : 0;
  const isUp = change >= 0;

  if (current === null) {
    return (
      <div className="hairline-border gold-glow rounded-xl bg-card p-6">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
          Gold Rate · 24K / oz (USD)
        </h2>
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="hairline-border gold-glow rounded-xl bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Gold Rate · 24K / oz (USD)
          </h2>
          <p className="font-serif-display mt-3 text-3xl text-primary">{formatCurrency(current)}</p>
        </div>
        <span className={`mt-1 text-sm ${isUp ? "text-primary" : "text-destructive-foreground"}`}>
          {isUp ? "+" : ""}
          {formatCurrency(change)} ({changePct.toFixed(2)}%) · 30d
        </span>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dashboardGoldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fill: "#8a8f98", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis domain={domain} hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeOpacity: 0.3 }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#dashboardGoldFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Illustrative gold price movement (USD per troy ounce).
      </p>
    </div>
  );
}
