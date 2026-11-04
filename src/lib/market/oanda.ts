export type MarketCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type CandleSeries = {
  instrument: string;
  symbol: string;
  timeframe: string;
  candles: MarketCandle[];
  last: number;
  changePct: number;
  updatedAt: string;
};

const SYMBOLS: Record<string, string> = {
  EURUSD: "EUR_USD",
  GBPUSD: "GBP_USD",
  USDJPY: "USD_JPY",
  AUDUSD: "AUD_USD",
  USDCAD: "USD_CAD",
  USDCHF: "USD_CHF",
  XAUUSD: "XAU_USD",
  XAGUSD: "XAG_USD",
  NAS100: "NAS100_USD",
  US30: "US30_USD",
  US500: "SPX500_USD",
  GER40: "DE30_EUR",
  WTIUSD: "WTICO_USD",
  NATGAS: "NATGAS_USD",
};

const GRANULARITY: Record<string, string> = {
  M5: "M5",
  M15: "M15",
  M30: "M30",
  H1: "H1",
  H4: "H4",
  D1: "D",
};

export function isSupported(instrument: string): boolean {
  return instrument.toUpperCase() in SYMBOLS;
}

export async function fetchCandles(
  instrument: string,
  timeframe: string,
  count = 320
): Promise<CandleSeries> {
  const apiKey = process.env.OANDA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OANDA_API_KEY is not configured");
  }

  const display = instrument.toUpperCase();
  const symbol = SYMBOLS[display];
  if (!symbol) {
    throw new Error(`Live Market Feed does not support ${display}`);
  }

  const tf = timeframe.toUpperCase();
  const granularity = GRANULARITY[tf];
  if (!granularity) {
    throw new Error(`Unsupported timeframe ${tf}`);
  }

  const base = (
    process.env.OANDA_BASE_URL ?? "https://api-fxtrade.oanda.com"
  ).replace(/\/+$/, "");
  const capped = Math.min(Math.max(count, 50), 500);
  const url = `${base}/v3/instruments/${encodeURIComponent(
    symbol
  )}/candles?granularity=${granularity}&count=${capped}&price=M`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Accept-Datetime-Format": "RFC3339",
    },
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    let detail = text.slice(0, 240);
    try {
      const parsed = JSON.parse(text) as { errorMessage?: string };
      detail = parsed.errorMessage ?? detail;
    } catch {
      /* keep raw */
    }
    throw new Error(`Live Market Feed ${response.status}: ${detail}`);
  }

  const payload = JSON.parse(text) as {
    candles?: Array<{
      time: string;
      complete: boolean;
      volume: number;
      mid: { o: string; h: string; l: string; c: string };
    }>;
  };

  const candles: MarketCandle[] = (payload.candles ?? [])
    .map((candle) => ({
      time: Math.floor(Date.parse(candle.time) / 1000),
      open: Number(candle.mid.o),
      high: Number(candle.mid.h),
      low: Number(candle.mid.l),
      close: Number(candle.mid.c),
      volume: candle.volume,
    }))
    .filter(
      (candle) =>
        Number.isFinite(candle.time) &&
        Number.isFinite(candle.open) &&
        Number.isFinite(candle.high) &&
        Number.isFinite(candle.low) &&
        Number.isFinite(candle.close)
    );

  if (!candles.length) {
    throw new Error("Live Market Feed returned no candles");
  }

  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const changePct = first === 0 ? 0 : ((last - first) / first) * 100;

  return {
    instrument: display,
    symbol,
    timeframe: tf,
    candles,
    last,
    changePct,
    updatedAt: new Date().toISOString(),
  };
}
