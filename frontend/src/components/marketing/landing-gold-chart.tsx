"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

const GOLD = "#ecc246";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Shown before data arrives so the hero card always renders a clean, on-brand graph
// rather than an empty box.
const FALLBACK_PRICE = 1506.3;
const FALLBACK_SERIES = [1520, 1512, 1517, 1508, 1513, 1498, 1489.85, 1506.3].map((price, i) => ({
  date: `f${i}`,
  price,
}));

interface HistoryRow {
  date: string;
  price: number;
}
interface LiveRow {
  price: number;
  date: string;
}

// Plain fetch (no auth header) — the landing page is anonymous, so it must never touch the
// authenticated api client, which would redirect to /login on a 401.
async function publicGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  const body = await res.json();
  if (!res.ok || !body.success) throw new Error(body.error ?? "request failed");
  return body.data as T;
}

export function LandingGoldChart() {
  const [points, setPoints] = useState<HistoryRow[] | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [history, live] = await Promise.all([
          publicGet<HistoryRow[]>("/api/market/gold/history?days=30"),
          publicGet<LiveRow>("/api/market/gold").catch(() => null),
        ]);
        if (cancelled) return;
        const latest = live?.price ?? history.at(-1)?.price ?? FALLBACK_PRICE;
        setPoints(history.length > 1 ? history : FALLBACK_SERIES);
        setPrice(latest);
      } catch {
        if (!cancelled) {
          setPoints(FALLBACK_SERIES);
          setPrice(FALLBACK_PRICE);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = points ?? FALLBACK_SERIES;
  const shownPrice = price ?? FALLBACK_PRICE;

  const { changePct, isUp } = useMemo(() => {
    const first = data[0]?.price ?? shownPrice;
    const last = data.at(-1)?.price ?? shownPrice;
    const pct = first ? ((last - first) / first) * 100 : 0;
    return { changePct: pct, isUp: pct >= 0 };
  }, [data, shownPrice]);

  const domain = useMemo<[number, number]>(() => {
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
        <p className="font-serif-display text-3xl text-primary">{formatCurrency(shownPrice)}</p>
        <span className={`text-xs ${isUp ? "text-primary" : "text-destructive-foreground"}`}>
          {isUp ? "+" : ""}
          {changePct.toFixed(2)}% · 30d
        </span>
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
