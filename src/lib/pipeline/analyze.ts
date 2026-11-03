import { MUSE_MODEL, SAM_MODEL, hasMetaKey } from "../meta/client";
import { segmentChart } from "../meta/segment";
import { reasonAboutChart } from "../meta/reason";
import { extractCandles } from "../vision/candles";
import { deriveFromCandles } from "../vision/geometry";
import { deriveMarketContext } from "../market/geometry";
import { mockGeometry, mockPlan } from "../fixtures/mock";
import type { MarketCandle } from "../market/oanda";
import type {
  AnalyzeResponse,
  ChartGeometry,
  MarketContext,
  SegmentationResult,
} from "../types";

export type AnalyzeInput = {
  imageBase64: string;
  mimeType: string;
  imageWidth: number;
  imageHeight: number;
  instrument: string;
  timeframe: string;
  candles?: MarketCandle[];
  mock: boolean;
};

function emptySegmentation(model: string): SegmentationResult {
  return {
    model,
    prompt: "candlestick chart",
    objects: 0,
    durationMs: 0,
    rawLength: 0,
    boxes: [],
    region: null,
    requestId: null,
  };
}

function geometryFromMarket(market: MarketContext): ChartGeometry {
  const span = market.rangeHigh - market.rangeLow || 1;
  return {
    candleCount: market.candleCount,
    trend:
      market.trend === "Uptrend"
        ? "Up"
        : market.trend === "Downtrend"
          ? "Down"
          : "Sideways",
    slopePct: (market.lastClose - market.rangeLow) / span - 0.5,
    rangeHigh: 0,
    rangeLow: 1,
    swingHighs: market.levels.filter((level) => level.type === "resistance").length,
    swingLows: market.levels.filter((level) => level.type === "support").length,
    levels: market.levels.map((level) => ({
      y: (market.rangeHigh - level.price) / span,
      type: level.type,
      touches: level.touches,
    })),
    boxes: [],
  };
}

export async function analyzeChart({
  imageBase64,
  mimeType,
  imageWidth,
  imageHeight,
  instrument,
  timeframe,
  candles,
  mock,
}: AnalyzeInput): Promise<AnalyzeResponse> {
  const started = Date.now();

  if (mock || !hasMetaKey()) {
    return {
      plan: mockPlan(instrument, timeframe),
      segmentation: emptySegmentation(SAM_MODEL),
      geometry: mockGeometry(),
      timings: { segmentMs: 0, reasonMs: 0, totalMs: Date.now() - started },
      models: { sam: SAM_MODEL, muse: MUSE_MODEL },
      requests: { sam: null, muse: null },
      mocked: true,
    };
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  const market =
    candles && candles.length > 0
      ? deriveMarketContext(candles, instrument, timeframe)
      : null;

  const segmentationPromise = segmentChart(dataUrl).catch((error: unknown) => {
    console.error(
      "[ChartCortex] segmentation failed:",
      error instanceof Error ? error.message : error
    );
    return emptySegmentation(SAM_MODEL);
  });

  const extractionPromise = market
    ? Promise.resolve(null)
    : extractCandles(buffer).catch((error: unknown) => {
        console.error(
          "[ChartCortex] candle extraction failed:",
          error instanceof Error ? error.message : error
        );
        return { width: imageWidth, height: imageHeight, candles: [] };
      });

  const [segmentation, extraction] = await Promise.all([
    segmentationPromise,
    extractionPromise,
  ]);

  const geometry = market
    ? geometryFromMarket(market)
    : deriveFromCandles(
        extraction?.candles ?? [],
        extraction?.width ?? imageWidth,
        extraction?.height ?? imageHeight
      );

  const reasoning = await reasonAboutChart({
    imageDataUrl: dataUrl,
    instrument,
    timeframe,
    geometry,
    market: market ?? undefined,
    panelDetected: Boolean(segmentation.region),
  });

  return {
    plan: reasoning.plan,
    segmentation,
    geometry,
    timings: {
      segmentMs: segmentation.durationMs,
      reasonMs: reasoning.durationMs,
      totalMs: Date.now() - started,
    },
    models: { sam: segmentation.model, muse: MUSE_MODEL },
    requests: { sam: segmentation.requestId, muse: reasoning.requestId },
    mocked: false,
  };
}
