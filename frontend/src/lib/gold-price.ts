export interface GoldPricePoint {
  date: string; // YYYY-MM-DD
  price: number; // USD per troy ounce
}

// Generates a realistic-looking random walk of daily gold prices (USD per troy ounce).
// Display-only — this is illustrative market movement, not a live feed.
//
// When `endPrice` is given, the walk is generated backward from today so the most recent
// point lands exactly on that value (used to anchor the chart to the admin-set gold price).
export function generateGoldSeries(days = 30, endPrice?: number): GoldPricePoint[] {
  const today = new Date();

  if (endPrice != null && endPrice > 0) {
    const reversed: GoldPricePoint[] = [];
    let price = endPrice;
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      reversed.push({ date: d.toISOString().slice(0, 10), price: Math.round(price * 100) / 100 });
      // Walk backward in time with small bounded noise, staying within a believable band
      // around the anchor so earlier days don't drift too far from it.
      price += (Math.random() - 0.5) * 24;
      price = Math.max(endPrice * 0.85, Math.min(endPrice * 1.15, price));
    }
    reversed[0].price = Math.round(endPrice * 100) / 100; // exact anchor on "today"
    return reversed.reverse();
  }

  const points: GoldPricePoint[] = [];
  let price = 2320 + Math.random() * 180; // start somewhere in ~2320–2500
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
