export interface GoldPricePoint {
  date: string; // YYYY-MM-DD
  price: number; // USD per troy ounce
}

// Generates a realistic-looking random walk of daily gold prices (USD per troy ounce),
// ending near a plausible current spot. Display-only — this is illustrative market
// movement, not a live feed.
export function generateGoldSeries(days = 30): GoldPricePoint[] {
  const points: GoldPricePoint[] = [];
  let price = 2320 + Math.random() * 180; // start somewhere in ~2320–2500
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    // Small daily drift + noise, gently bounded so it stays in a believable band.
    price += (Math.random() - 0.48) * 24;
    price = Math.max(2100, Math.min(2750, price));
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    points.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    });
  }
  return points;
}
