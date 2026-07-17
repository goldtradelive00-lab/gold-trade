"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { generateGoldSeries, type GoldPricePoint } from "@/lib/gold-price";

const GOLD = "#ecc246";

export function LandingGoldChart() {
  const [points, setPoints] = useState<GoldPricePoint[] | null>(null);

  // Generate on the client after mount to avoid a server/client hydration mismatch
  // from the randomised data.
  useEffect(() => {
    setPoints(generateGoldSeries(30));
  }, []);

  const data = points ?? [];
  const shownPrice = data.at(-1)?.price ?? 0;

  const { changePct, isUp } = useMemo(() => {
    const first = data[0]?.price ?? shownPrice;
    const last = data.at(-1)?.price ?? shownPrice;
    const pct = first ? ((last - first) / first) * 100 : 0;
    return { changePct: pct, isUp: pct >= 0 };
  }, [data, shownPrice]);

  const domain = useMemo<[number, number]>(() => {
    if (data.length === 0) return [0, 1];
    const values = data.map((d) => d.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(1, (max - min) * 0.2 || max * 0.002);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [data]);

  const loading = points === null;

  return (
    <div className={loading ? "animate-pulse" : ""}>
      <div className="flex items-baseline justify-between">
        <p className="font-serif-display text-3xl text-primary">
          {formatCurrency(shownPrice)}
        </p>
        {!loading && (
          <span className={`text-xs ${isUp ? "text-primary" : "text-destructive-foreground"}`}>
            {isUp ? "+" : ""}
            {changePct.toFixed(2)}% · 30d
          </span>
        )}
      </div>
      <div className="mt-4 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="landingGoldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={domain} hide />
            <Area
              type="monotone"
              dataKey="price"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#landingGoldFill)"
              isAnimationActive={!loading}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
