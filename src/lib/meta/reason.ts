import { MUSE_MODEL, metaRequest, readOutputText } from "./client";
import type { ResponseRequest } from "./client";
import { buildSystemPrompt } from "../prompts/system";
import {
  PLAN_SCHEMA_NAME,
  tradePlanJsonSchema,
  tradePlanSchema,
  type TradePlan,
} from "../schema/plan";
import type { ChartGeometry, MarketContext } from "../types";

export type ReasonInput = {
  imageDataUrl: string;
  instrument: string;
  timeframe: string;
  geometry: ChartGeometry;
  market?: MarketContext;
  panelDetected: boolean;
};

export async function reasonAboutChart({
  imageDataUrl,
  instrument,
  timeframe,
  geometry,
  market,
  panelDetected,
}: ReasonInput): Promise<{
  plan: TradePlan;
  durationMs: number;
  requestId: string | null;
}> {
  const started = Date.now();

  const body: ResponseRequest = {
    model: MUSE_MODEL,
    reasoning: { effort: "low" },
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: buildSystemPrompt({
              instrument,
              timeframe,
              geometry,
              market,
              panelDetected,
            }),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Read this chart image and return the complete trade plan JSON.",
          },
          { type: "input_image", image_url: imageDataUrl, detail: "high" },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: PLAN_SCHEMA_NAME,
        schema: tradePlanJsonSchema as Record<string, unknown>,
        strict: true,
      },
    },
    max_output_tokens: 8000,
  };

  const response = await metaRequest("/responses", body, 35_000);

  if (response.status === "incomplete") {
    const reason = response.incomplete_details?.reason ?? "unknown";
    throw new Error(`Muse Spark response incomplete: ${reason}`);
  }

  const raw = readOutputText(response);
  if (!raw.trim()) {
    throw new Error("Muse Spark returned an empty response");
  }

  const plan = tradePlanSchema.parse(JSON.parse(raw));

  return { plan, durationMs: Date.now() - started, requestId: response.id ?? null };
}
