import { NextResponse } from "next/server";
import { fetchCandles } from "@/lib/market/oanda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instrument = (searchParams.get("instrument") ?? "XAUUSD").slice(0, 16);
  const timeframe = (searchParams.get("timeframe") ?? "H1").slice(0, 8);
  const count = Number(searchParams.get("count") ?? 320);

  try {
    const series = await fetchCandles(instrument, timeframe, count);
    return NextResponse.json(series, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Market data failed";
    console.error("[chartcortex] candles failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
