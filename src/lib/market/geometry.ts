import type { MarketCandle } from "./oanda";
import type { MarketContext, MarketLevel } from "../types";

type Touch = { price: number; type: "support" | "resistance" };

export function deriveMarketContext(
  candles: MarketCandle[],
  instrument: string,
  timeframe: string
): MarketContext {
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const closes = candles.map((candle) => candle.close);

  const rangeHigh = Math.max(...highs);
  const rangeLow = Math.min(...lows);
  const range = Math.max(rangeHigh - rangeLow, 1e-9);
  const tolerance = Math.max(range * 0.0015, 1e-9);

  const touches: Touch[] = [];
  for (let i = 2; i < candles.length - 2; i += 1) {
    const windowHighs = highs.slice(i - 2, i + 3);
    const windowLows = lows.slice(i - 2, i + 3);
    if (highs[i] >= Math.max(...windowHighs)) {
      touches.push({ price: highs[i], type: "resistance" });
    }
    if (lows[i] <= Math.min(...windowLows)) {
      touches.push({ price: lows[i], type: "support" });
    }
  }

  const clusters: { price: number; type: "support" | "resistance"; count: number }[] = [];
  for (const touch of touches) {
    const hit = clusters.find(
      (cluster) =>
        cluster.type === touch.type &&
        Math.abs(cluster.price - touch.price) <= tolerance
    );
    if (hit) {
      hit.price = (hit.price * hit.count + touch.price) / (hit.count + 1);
      hit.count += 1;
    } else {
      clusters.push({ price: touch.price, type: touch.type, count: 1 });
    }
  }

  const levels: MarketLevel[] = clusters
    .filter((cluster) => cluster.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((cluster) => ({
      price: cluster.price,
      type: cluster.type,
      touches: cluster.count,
    }));

  const first = closes[0];
  const lastClose = closes[closes.length - 1];
  const trend: MarketContext["trend"] =
    lastClose > first + range * 0.02
      ? "Uptrend"
      : lastClose < first - range * 0.02
        ? "Downtrend"
        : "Ranging";

  return {
    instrument,
    timeframe,
    candleCount: candles.length,
    lastClose,
    rangeHigh,
    rangeLow,
    trend,
    levels,
  };
}
