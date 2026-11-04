"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import LiveChart, { type LiveChartHandle } from "@/components/LiveChart";
import { ReportView, type ReportData } from "@/components/ReportView";
import type { AnalyzeResponse } from "@/lib/types";
import type { CandleSeries } from "@/lib/market/oanda";

const TIMEFRAMES = ["M5", "M15", "M30", "H1", "H4", "D1"];

const ASSET_GROUPS = [
  {
    name: "Metals",
    items: [
      { symbol: "XAUUSD", name: "Gold" },
      { symbol: "XAGUSD", name: "Silver" },
    ],
  },
  {
    name: "Forex majors",
    items: [
      { symbol: "EURUSD", name: "Euro" },
      { symbol: "GBPUSD", name: "Cable" },
      { symbol: "USDJPY", name: "Yen" },
      { symbol: "AUDUSD", name: "Aussie" },
      { symbol: "USDCAD", name: "Loonie" },
      { symbol: "USDCHF", name: "Swiss" },
    ],
  },
  {
    name: "Indices",
    items: [
      { symbol: "NAS100", name: "Nasdaq 100" },
      { symbol: "US30", name: "Dow 30" },
      { symbol: "US500", name: "S&P 500" },
      { symbol: "GER40", name: "DAX 40" },
    ],
  },
  {
    name: "Energies",
    items: [
      { symbol: "WTIUSD", name: "WTI Crude" },
      { symbol: "NATGAS", name: "Natural Gas" },
    ],
  },
];

const ALL_ASSETS = ASSET_GROUPS.flatMap((group) => group.items);

function precisionFor(instrument: string): number {
  const s = instrument.toUpperCase();
  if (/JPY|XAG|NAS|US30|US500|GER40|WTI|NATGAS/.test(s)) return 3;
  if (/XAU/.test(s)) return 2;
  return 5;
}

function formatPrice(value: number | null | undefined, instrument = "XAUUSD"): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  const digits = precisionFor(instrument);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Math.min(digits, 2),
    maximumFractionDigits: digits,
  }).format(value);
}

function formatSigned(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function toReportData(
  plan: AnalyzeResponse["plan"],
  totalMs: number
): ReportData {
  return {
    instrument: plan.instrument,
    timeframe: plan.timeframe,
    bias: plan.bias,
    confidence: plan.confidence,
    riskLevel: plan.riskLevel,
    entryLow: plan.entryZone.low,
    entryHigh: plan.entryZone.high,
    stop: plan.stopLoss,
    targets: plan.takeProfits.map((tp, index) => ({
      label: tp.label || `TP${index + 1}`,
      price: tp.price,
    })),
    summary: plan.summary,
    driver: plan.primaryDriver,
    trend: plan.trend,
    support: plan.keyLevels.support,
    resistance: plan.keyLevels.resistance,
    invalidation: plan.devilsAdvocate.invalidation,
    bos: plan.marketStructure.recentBos,
    choch: plan.marketStructure.recentChoch,
    liquidity: plan.marketStructure.liquidityNotes,
    metaTime: `${(totalMs / 1000).toFixed(1)}s`,
  };
}
export default function ScanWorkbench() {
  const [instrument, setInstrument] = useState("XAUUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState<CandleSeries | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "analysing">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);


  const chartRef = useRef<LiveChartHandle>(null);

  const activeAsset =
    ALL_ASSETS.find((asset) => asset.symbol === instrument) ?? {
      symbol: instrument,
      name: "Custom",
    };

  const groups = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return ASSET_GROUPS;
    return ASSET_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.symbol.includes(q) || item.name.toUpperCase().includes(q)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cc-pinned") ?? "[]");
      if (Array.isArray(stored)) setPinned(stored.filter((s) => typeof s === "string"));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const togglePin = (symbol: string) => {
    setPinned((current) => {
      const next = current.includes(symbol)
        ? current.filter((s) => s !== symbol)
        : [...current, symbol];
      try {
        localStorage.setItem("cc-pinned", JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const pinnedAssets = ALL_ASSETS.filter((asset) => pinned.includes(asset.symbol));


  const loadSeries = useCallback(
    async (silent = false) => {
      if (!silent) setMarketLoading(true);
      try {
        const response = await fetch(
          `/api/market/candles?instrument=${encodeURIComponent(
            instrument
          )}&timeframe=${timeframe}&count=320`,
          { cache: "no-store" }
        );
        const payload = (await response.json()) as CandleSeries & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Market data failed");
        setSeries(payload);
        setMarketError(null);
        setUpdatedAt(new Date().toISOString().slice(11, 19) + " UTC");
      } catch (err) {
        if (!silent) {
          setMarketError(
            err instanceof Error ? err.message : "Could not load market data"
          );
        }
      } finally {
        if (!silent) setMarketLoading(false);
      }
    },
    [instrument, timeframe]
  );

  useEffect(() => {
    setResult(null);
    setError(null);
    void loadSeries();
    const timer = window.setInterval(() => void loadSeries(true), 15000);
    return () => window.clearInterval(timer);
  }, [loadSeries]);

  useEffect(() => {
    if (status === "idle") return;
    const started = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 100);
    return () => window.clearInterval(timer);
  }, [status]);

  const runAnalysis = useCallback(async () => {
    const snapshot = chartRef.current?.snapshot();
    if (!snapshot) {
      setError("The chart is not ready yet");
      return;
    }

    setStatus("analysing");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: snapshot.dataUrl.split(",")[1] ?? "",
          mimeType: "image/jpeg",
          imageWidth: snapshot.width,
          imageHeight: snapshot.height,
          instrument,
          timeframe,
          candles: series?.candles,
        }),
      });
      const payload = (await response.json()) as AnalyzeResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Analysis failed");
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setStatus("idle");
    }
  }, [instrument, timeframe, series]);

  const refresh = useCallback(() => {
    setResult(null);
    setError(null);
    void loadSeries();
  }, [loadSeries]);

  const plan = result?.plan;
  const busy = status === "analysing";
  const last = series?.candles.length ? series.candles[series.candles.length - 1] : null;
  const live = Boolean(series) && !marketError;
  const rangeHigh = series?.candles.length
    ? Math.max(...series.candles.map((candle) => candle.high))
    : null;
  const rangeLow = series?.candles.length
    ? Math.min(...series.candles.map((candle) => candle.low))
    : null;
  const rangePct =
    rangeHigh !== null && rangeLow !== null && last && rangeHigh > rangeLow
      ? Math.min(
          100,
          Math.max(0, ((last.close - rangeLow) / (rangeHigh - rangeLow)) * 100)
        )
      : 50;
  const chartPlan = plan
    ? {
        entryLow: plan.entryZone.low,
        entryHigh: plan.entryZone.high,
        stop: plan.stopLoss,
        targets: plan.takeProfits.map((tp) => tp.price),
      }
    : null;
  const chartLevels = plan
    ? [
        { price: plan.keyLevels.support, type: "support" as const },
        { price: plan.keyLevels.resistance, type: "resistance" as const },
      ]
    : [];


  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden>
        <div className="aurora-blob aurora-blob-a" />
        <div className="aurora-blob aurora-blob-b" />
        <div className="aurora-blob aurora-blob-c" />
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="ChartCortex home">
              <LogoLockup size={34} />
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden font-chivo text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
              Terminal
            </span>
            <span
              className={`inline-flex h-[38px] items-center gap-1.5 rounded-xl border px-3 font-chivo text-[9px] font-semibold uppercase tracking-[0.12em] ${
                live
                  ? "border-up/25 bg-up/[0.07] text-up"
                  : "border-line bg-surface-2 text-muted"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  live ? "animate-pulse bg-up" : "bg-muted/50"
                }`}
              />
              {live ? "Live feed" : marketError ? "Offline" : "Connecting"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="glass-chip hidden h-[38px] items-center px-3 font-mono text-[9.5px] leading-[38px] text-accent lg:flex">
              META MODELS
            </span>
            <ThemeToggle />
          </div>
        </div>
        <div className="brand-rule" aria-hidden />
      </header>


      <main className="relative z-10 mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:h-[calc(100vh-68px)] lg:grid-cols-[220px_minmax(0,1fr)_400px]">
        <aside className="hidden min-h-0 lg:block">
          <div className="glass-card flex h-full flex-col overflow-hidden">
            <div className="border-b border-line p-3">
              <div className="flex items-center justify-between">
                <span className="font-chivo text-[10px] uppercase tracking-[0.16em] text-muted">
                  Assets
                </span>
                <span className="font-mono text-[10px] text-muted">{ALL_ASSETS.length}</span>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search market"
                className="mt-2 w-full rounded-lg border border-line bg-canvas/50 px-2.5 py-1.5 text-[12px] text-ink outline-none backdrop-blur placeholder:text-muted focus:border-accent/40"
              />
              <p className="mt-2 text-[10px] leading-relaxed text-muted">
                Live Market Feed. Select an asset, then a timeframe.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {pinnedAssets.length > 0 && !query.trim() && (
                <div className="mb-3">
                  <div className="px-2 pb-1 font-chivo text-[9px] uppercase tracking-[0.14em] text-muted">
                    Pinned
                  </div>
                  {pinnedAssets.map((item) => (
                    <AssetRow
                      key={`pin-${item.symbol}`}
                      item={item}
                      active={item.symbol === instrument}
                      pinned
                      onSelect={() => setInstrument(item.symbol)}
                      onTogglePin={() => togglePin(item.symbol)}
                    />
                  ))}
                </div>
              )}
              {groups.map((group) => {
                const items =
                  query.trim() || pinnedAssets.length === 0
                    ? group.items
                    : group.items.filter((item) => !pinned.includes(item.symbol));
                if (!items.length) return null;
                return (
                  <div key={group.name} className="mb-3">
                    <div className="flex items-center justify-between px-2 pb-1">
                      <span className="font-chivo text-[9px] uppercase tracking-[0.14em] text-muted">
                        {group.name}
                      </span>
                      <span className="font-mono text-[9px] text-muted/60">
                        {items.length}
                      </span>
                    </div>
                    {items.map((item) => (
                      <AssetRow
                        key={item.symbol}
                        item={item}
                        active={item.symbol === instrument}
                        pinned={pinned.includes(item.symbol)}
                        onSelect={() => setInstrument(item.symbol)}
                        onTogglePin={() => togglePin(item.symbol)}
                      />
                    ))}
                  </div>
                );
              })}
              {!groups.length && (
                <p className="px-2 py-6 text-center text-[11px] text-muted">
                  No market matches.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col gap-4">
          <div className="glass-card flex min-h-0 flex-1 flex-col p-4">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-chivo text-[22px] font-bold uppercase leading-none tracking-[0.01em]">
                    {activeAsset.symbol}
                  </span>
                  <span className="text-[12px] text-muted">{activeAsset.name}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="font-mono text-[30px] leading-none text-ink">
                    {last ? formatPrice(last.close, instrument) : "n/a"}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${
                      (series?.changePct ?? 0) >= 0
                        ? "bg-up/10 text-up"
                        : "bg-down/10 text-down"
                    }`}
                  >
                    {formatSigned(series?.changePct ?? 0)}
                  </span>
                </div>
              </div>

              <div className="hidden w-[300px] shrink-0 sm:block">
                <div className="flex items-center justify-between font-mono text-[9.5px] text-muted">
                  <span>{rangeLow !== null ? formatPrice(rangeLow, instrument) : "n/a"}</span>
                  <span className="font-chivo text-[8.5px] uppercase tracking-[0.14em] text-muted/60">
                    range
                  </span>
                  <span>{rangeHigh !== null ? formatPrice(rangeHigh, instrument) : "n/a"}</span>
                </div>
                <div className="relative mt-1.5 h-1.5 rounded-full bg-surface-2">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent/25 to-accent/60"
                    style={{ width: `${rangePct}%` }}
                  />
                  <span
                    className="absolute -top-[3px] h-3 w-[3px] rounded-full bg-accent shadow-[0_0_8px_rgba(129,255,217,0.8)]"
                    style={{ left: `calc(${rangePct}% - 1.5px)` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] text-muted/70">
                  <span>{Math.round(rangePct)}% of range</span>
                  <span>{updatedAt ?? (marketError ? "no feed" : "connecting")}</span>
                </div>
              </div>
            </div>


            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-mono text-[10px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                {series
                  ? `${series.candles.length} candles / ${series.timeframe} / Live Market Feed`
                  : "loading"}
              </span>
              <button
                type="button"
                onClick={refresh}
                className="glass-chip flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] text-muted transition-colors hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 11a8 8 0 1 0-2.3 5.7" />
                  <path d="M20 4v7h-7" />
                </svg>
                Refresh
              </button>
            </div>

            <div className="relative mt-2 flex-1 min-h-0 overflow-hidden rounded-xl border border-line bg-canvas">
              {marketError ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="text-[13px] text-down">Live feed unavailable</span>
                  <span className="max-w-[340px] text-[11px] leading-relaxed text-muted">{marketError}</span>
                  <button
                    type="button"
                    onClick={refresh}
                    className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] text-muted hover:text-ink"
                  >
                    Retry
                  </button>
                </div>
              ) : series ? (
                <LiveChart
                  ref={chartRef}
                  instrument={instrument}
                  timeframe={timeframe}
                  candles={series.candles}
                  levels={chartLevels}
                  plan={chartPlan}
                  scanning={busy}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-muted">
                  {marketLoading ? "Loading live chart..." : "No data"}
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-stretch rounded-xl border border-line bg-surface-2/70 p-1">
                {TIMEFRAMES.map((tf) => {
                  const active = tf === timeframe;
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      aria-pressed={active}
                      className={`flex-1 rounded-lg py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-all duration-200 ${
                        active
                          ? "bg-teal text-[#04120F] shadow-[0_0_18px_-6px_rgba(129,255,217,0.9)]"
                          : "text-muted hover:bg-surface/70 hover:text-ink"
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={!series || busy || Boolean(marketError)}
                className="scan-btn btn btn-teal w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? `Analysing ${elapsed.toFixed(1)}s` : "Analyse"}
              </button>
            </div>


            {result && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Candles" value={String(result.geometry.candleCount)} />
                <Stat label="Levels" value={String(result.geometry.levels.length)} />
                <Stat label="Vision" value={`${(result.timings.segmentMs / 1000).toFixed(2)}s`} />
                <Stat label="Total" value={`${(result.timings.totalMs / 1000).toFixed(2)}s`} />
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-down/25 bg-down/[0.06] px-3 py-2 text-[12px] text-down">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 min-w-0 flex-col">
          <div className="glass-card relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 pl-5">
            <span
              className="absolute inset-y-4 left-0 w-[2px] rounded-full bg-gradient-to-b from-accent/80 via-violet-ink/40 to-pink/70"
              aria-hidden
            />
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-chivo text-[10px] uppercase tracking-[0.16em] text-muted">
                AI report
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    busy ? "animate-pulse bg-pink" : plan ? "bg-up" : "bg-muted/40"
                  }`}
                />
                {busy ? "Analysing" : plan ? "Ready" : "Idle"}
              </span>
            </div>


            <div className="report-scroll min-h-0 flex-1 overflow-y-auto pr-1">
            {!plan && busy && <ScanningState elapsed={elapsed} />}

            {!plan && !busy && (
              <div className="pt-8">
                <div className="font-chivo text-[18px] font-bold leading-tight">
                  The report writes itself here.
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  One bias, one entry zone, a stop, three targets and the reasoning.
                  Nothing runs until you press analyse.
                </p>
                <ol className="mt-5 space-y-3">
                  <EmptyStep n="01" title="Pick the asset" text="Choose the market and timeframe on the left." />
                  <EmptyStep n="02" title="The chart loads live" text="Live market candles stream into the chart." />
                  <EmptyStep n="03" title="Analyse" text="SAM reads the chart, Muse Spark returns the plan." />
                </ol>
                <div className="mt-8 opacity-40">
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-20 rounded bg-surface-2" />
                    <span className="h-2 w-10 rounded bg-surface-2" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 rounded-lg border border-line bg-surface-2/50"
                      />
                    ))}
                  </div>
                  <div className="mt-2 h-10 rounded-lg border border-line bg-surface-2/40" />
                </div>
                <p className="mt-2 font-chivo text-[8.5px] uppercase tracking-[0.14em] text-muted">
                  Preview of the report
                </p>
              </div>
            )}

            {plan && result && (
              <div className="pt-3">
                <ReportView
                  data={toReportData(plan, result.timings.totalMs)}
                  format={(value) => formatPrice(value, plan.instrument)}
                  idSuffix="terminal"
                  showHeader={false}
                  receipt={{
                    sam: result.requests.sam,
                    muse: result.requests.muse,
                  }}
                />
              </div>
            )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ScanningState({ elapsed }: { elapsed: number }) {
  const stages = [
    { label: "Segmenting the chart", model: "SAM 3.1", at: 0 },
    { label: "Measuring structure", model: "geometry", at: 5 },
    { label: "Writing the plan", model: "Muse Spark", at: 11 },
  ];
  const active = elapsed >= 11 ? 2 : elapsed >= 5 ? 1 : 0;

  return (
    <div className="pt-8">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-chivo text-[18px] font-bold leading-tight">
          Reading the live chart.
        </div>
        <span className="font-mono text-[11px] text-muted">{elapsed.toFixed(1)}s</span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        SAM 3.1 segments the chart, then Muse Spark writes the plan. A full run
        usually lands between 15 and 30 seconds.
      </p>

      <div className="mt-6 space-y-3">
        {stages.map((stage, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${
                  done
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : current
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-line bg-surface-2 text-muted"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <span
                className={`flex-1 text-[12px] ${
                  done || current ? "text-ink" : "text-muted/70"
                }`}
              >
                {stage.label}
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.1em] ${
                  current ? "text-accent" : "text-muted/60"
                }`}
              >
                {stage.model}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="scan-progress h-full w-1/3 rounded-full bg-gradient-to-r from-accent via-violet-ink to-pink" />
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-2 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-2 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-2 w-2/3 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg border border-line bg-surface-2/40"
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-chivo text-[9px] uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-ink">{value}</div>
    </div>
  );
}

function EmptyStep({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="font-mono text-[10px] text-accent">{n}</span>
      <div>
        <div className="text-[12px] font-semibold text-ink">{title}</div>
        <div className="text-[11px] leading-relaxed text-muted">{text}</div>
      </div>
    </li>
  );
}

function AssetRow({
  item,
  active,
  pinned,
  onSelect,
  onTogglePin,
}: {
  item: { symbol: string; name: string };
  active: boolean;
  pinned: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}) {
  return (
    <div
      className={`group/row relative flex items-center rounded-lg transition-colors ${
        active ? "bg-teal/[0.08]" : "hover:bg-surface-2"
      }`}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center justify-between gap-2 px-2 py-1.5 text-left"
      >
        <span
          className={`font-mono text-[11.5px] ${active ? "text-accent" : "text-ink"}`}
        >
          {item.symbol}
        </span>
        <span
          className={`text-[10.5px] ${active ? "text-accent/70" : "text-muted"}`}
        >
          {item.name}
        </span>
      </button>
      <button
        type="button"
        onClick={onTogglePin}
        aria-label={pinned ? `Unpin ${item.symbol}` : `Pin ${item.symbol}`}
        aria-pressed={pinned}
        className={`mr-1 grid h-5 w-5 place-items-center rounded text-[11px] transition-opacity ${
          pinned
            ? "text-accent opacity-100"
            : "text-muted opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
        }`}
      >
        {pinned ? "★" : "☆"}
      </button>
    </div>
  );
}

