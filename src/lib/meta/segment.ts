import { SAM_MODEL, metaRequest, readOutputText } from "./client";
import type { ResponseRequest } from "./client";
import type { ChartBox, SegmentationResult } from "../types";

const BOX_PATTERN =
  /(\d+)\s*<\|box;x1=(-?\d+(?:\.\d+)?);y1=(-?\d+(?:\.\d+)?);x2=(-?\d+(?:\.\d+)?);y2=(-?\d+(?:\.\d+)?)(?:;w=(-?\d+(?:\.\d+)?);h=(-?\d+(?:\.\d+)?))?/g;

export function parseBoxes(text: string): ChartBox[] {
  const found: ChartBox[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(BOX_PATTERN)) {
    const ordinal = Number(match[1]);
    const x1 = Number(match[2]);
    const y1 = Number(match[3]);
    const x2 = Number(match[4]);
    const y2 = Number(match[5]);
    const w = match[6] ? Number(match[6]) : Math.abs(x2 - x1);
    const h = match[7] ? Number(match[7]) : Math.abs(y2 - y1);
    if (![x1, y1, x2, y2, w, h].every(Number.isFinite)) continue;
    if (w <= 0 || h <= 0) continue;
    const key = `${Math.round(x1)}:${Math.round(y1)}:${Math.round(x2)}:${Math.round(y2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      ordinal,
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
      w,
      h,
    });
  }
  return found;
}

export async function segmentChart(
  imageDataUrl: string,
  prompt = "candlestick chart"
): Promise<SegmentationResult> {
  const started = Date.now();

  const body: ResponseRequest = {
    model: SAM_MODEL,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageDataUrl, detail: "high" },
        ],
      },
    ],
    max_output_tokens: 8192,
    metadata: { mask_encoding: "one_bit", include_confidence: "true" },
  };

  const response = await metaRequest("/responses", body, 20_000);
  const text = readOutputText(response);
  const boxes = parseBoxes(text);
  const region =
    boxes.length > 0
      ? boxes.reduce((largest, box) =>
          box.w * box.h > largest.w * largest.h ? box : largest
        )
      : null;

  return {
    model: SAM_MODEL,
    prompt,
    objects: boxes.length,
    durationMs: Date.now() - started,
    rawLength: text.length,
    boxes,
    region,
  };
}
