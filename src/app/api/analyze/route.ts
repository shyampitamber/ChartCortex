import { NextResponse } from "next/server";
import { analyzeChart } from "@/lib/pipeline/analyze";
import { hasMetaKey } from "@/lib/meta/client";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnalyzeBody = {
  imageBase64?: string;
  mimeType?: string;
  imageWidth?: number;
  imageHeight?: number;
  instrument?: string;
  timeframe?: string;
  mock?: boolean;
};

const MAX_BASE64 = 8_000_000;

export async function GET() {
  return NextResponse.json({
    service: "ChartCortex-analyze",
    metaKeyConfigured: hasMetaKey(),
  });
}

export async function POST(request: Request) {
  let body: AnalyzeBody;
  try {
    body = (await request.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageBase64, mimeType, imageWidth, imageHeight } = body;

  if (!imageBase64 || !mimeType) {
    return NextResponse.json(
      { error: "imageBase64 and mimeType are required" },
      { status: 400 }
    );
  }
  if (imageBase64.length > MAX_BASE64) {
    return NextResponse.json(
      { error: "Image too large. Resize below 6 MB before upload." },
      { status: 413 }
    );
  }
  if (!imageWidth || !imageHeight || imageWidth <= 0 || imageHeight <= 0) {
    return NextResponse.json(
      { error: "imageWidth and imageHeight are required" },
      { status: 400 }
    );
  }
  if (!/^image\/(png|jpeg|webp)$/.test(mimeType)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG or WebP images are supported" },
      { status: 415 }
    );
  }

  const started = Date.now();
  try {
    const result = await analyzeChart({
      imageBase64,
      mimeType,
      imageWidth,
      imageHeight,
      instrument: (body.instrument || "UNKNOWN").slice(0, 24),
      timeframe: (body.timeframe || "UNKNOWN").slice(0, 12),
      mock: Boolean(body.mock),
    });

    return NextResponse.json(result, {
      headers: { "x-ChartCortex-ms": String(Date.now() - started) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("[ChartCortex] analyze failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
