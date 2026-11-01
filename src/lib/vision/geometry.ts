import type { ChartGeometry, DetectedLevel, NormalizedBox } from "../types";
import type { ExtractedCandle } from "./candles";

const EMPTY: ChartGeometry = {
  candleCount: 0,
  trend: "Sideways",
  slopePct: 0,
  rangeHigh: 0,
  rangeLow: 0,
  swingHighs: 0,
  swingLows: 0,
  levels: [],
  boxes: [],
};

const round4 = (value: number) => Math.round(value * 10000) / 10000;

function clusterLevels(
  candles: ExtractedCandle[],
  imageHeight: number
): DetectedLevel[] {
  const tolerance = Math.max(2, imageHeight * 0.008);
  const touches: { y: number; kind: "support" | "resistance" }[] = [];

  for (let i = 2; i < candles.length - 2; i += 1) {
    const window = candles.slice(i - 2, i + 3);
    const isHigh = window.every((c) => c.top >= candles[i].top);
    const isLow = window.every((c) => c.bottom <= candles[i].bottom);
    if (isHigh) touches.push({ y: candles[i].top, kind: "resistance" });
    if (isLow) touches.push({ y: candles[i].bottom, kind: "support" });
  }

  const clusters: { y: number; kind: "support" | "resistance"; count: number }[] = [];
  for (const touch of touches) {
    const hit = clusters.find(
      (c) => c.kind === touch.kind && Math.abs(c.y - touch.y) <= tolerance
    );
    if (hit) {
      hit.y = (hit.y * hit.count + touch.y) / (hit.count + 1);
      hit.count += 1;
    } else {
      clusters.push({ y: touch.y, kind: touch.kind, count: 1 });
    }
  }

  return clusters
    .filter((c) => c.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((c) => ({
      y: round4(c.y / imageHeight),
      type: c.kind,
      touches: c.count,
    }));
}

export function deriveFromCandles(
  candles: ExtractedCandle[],
  imageWidth: number,
  imageHeight: number
): ChartGeometry {
  if (!candles.length || imageWidth <= 0 || imageHeight <= 0) return EMPTY;

  const mids = candles.map((c) => (c.bodyTop + c.bodyBottom) / 2);
  const travel = mids[mids.length - 1] - mids[0];
  const slopePct = round4(travel / imageHeight);
  const trend: ChartGeometry["trend"] =
    slopePct < -0.06 ? "Up" : slopePct > 0.06 ? "Down" : "Sideways";

  const levels = clusterLevels(candles, imageHeight);
  const boxes: NormalizedBox[] = candles.slice(0, 400).map((c) => ({
    x: round4(c.x1 / imageWidth),
    y: round4(c.top / imageHeight),
    w: round4((c.x2 - c.x1 + 1) / imageWidth),
    h: round4((c.bottom - c.top + 1) / imageHeight),
  }));

  const tops = candles.map((c) => c.top);
  const bottoms = candles.map((c) => c.bottom);

  return {
    candleCount: candles.length,
    trend,
    slopePct,
    rangeHigh: round4(Math.min(...tops) / imageHeight),
    rangeLow: round4(Math.max(...bottoms) / imageHeight),
    swingHighs: levels.filter((l) => l.type === "resistance").length,
    swingLows: levels.filter((l) => l.type === "support").length,
    levels,
    boxes,
  };
}
