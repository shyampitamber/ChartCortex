import { metaClient, MUSE_MODEL } from "./client";
import { buildSystemPrompt } from "../prompts/system";
import {
  PLAN_SCHEMA_NAME,
  tradePlanJsonSchema,
  tradePlanSchema,
  type TradePlan,
} from "../schema/plan";
import type { ChartGeometry } from "../types";

export type ReasonInput = {
  imageDataUrl: string;
  instrument: string;
  timeframe: string;
  geometry: ChartGeometry;
  panelDetected: boolean;
};

export async function reasonAboutChart({
  imageDataUrl,
  instrument,
  timeframe,
  geometry,
  panelDetected,
}: ReasonInput): Promise<{ plan: TradePlan; durationMs: number }> {
  const started = Date.now();
  const client = metaClient();

  const response = await client.responses.create({
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
        schema: tradePlanJsonSchema,
        strict: true,
      },
    },
    max_output_tokens: 8000,
  });

  if (response.status === "incomplete") {
    const reason = response.incomplete_details?.reason ?? "unknown";
    throw new Error(`Muse Spark response incomplete: ${reason}`);
  }

  const raw = response.output_text ?? "";
  if (!raw.trim()) {
    throw new Error("Muse Spark returned an empty response");
  }

  const plan = tradePlanSchema.parse(JSON.parse(raw));

  return { plan, durationMs: Date.now() - started };
}
