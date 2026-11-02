import { MUSE_MODEL, SAM_MODEL, hasMetaKey } from "../meta/client";
import { segmentChart } from "../meta/segment";
import { reasonAboutChart } from "../meta/reason";
import { extractCandles } from "../vision/candles";
import { deriveFromCandles } from "../vision/geometry";
import { mockGeometry, mockPlan } from "../fixtures/mock";
import type { AnalyzeResponse, SegmentationResult } from "../types";

export type AnalyzeInput = {
  imageBase64: string;
  mimeType: string;
  imageWidth: number;
  imageHeight: number;
  instrument: string;
  timeframe: string;
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

export async function analyzeChart({
  imageBase64,
  mimeType,
  imageWidth,
  imageHeight,
  instrument,
  timeframe,
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

  const [segmentation, extraction] = await Promise.all([
    segmentChart(dataUrl).catch((error: unknown) => {
      console.error(
        "[ChartCortex] segmentation failed:",
        error instanceof Error ? error.message : error
      );
      return emptySegmentation(SAM_MODEL);
    }),
    extractCandles(buffer).catch((error: unknown) => {
      console.error(
        "[ChartCortex] candle extraction failed:",
        error instanceof Error ? error.message : error
      );
      return { width: imageWidth, height: imageHeight, candles: [] };
    }),
  ]);

  const geometry = deriveFromCandles(
    extraction.candles,
    extraction.width,
    extraction.height
  );

  const reasoning = await reasonAboutChart({
    imageDataUrl: dataUrl,
    instrument,
    timeframe,
    geometry,
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
