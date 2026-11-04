"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import LiveChart, { type LiveChartHandle } from "@/components/LiveChart";
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

const biasTone: Record<string, string> = {
  Bullish: "border-up/25 bg-up/10 text-up",
  Bearish: "border-down/25 bg-down/10 text-down",
  Neutral: "border-line bg-surface-2 text-muted",
};

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

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_15%_-10%,rgba(16,91,255,0.14),transparent_55%),radial-gradient(ellipse_at_85%_-20%,rgba(243,85,208,0.12),transparent_55%)]" />

      <header className="glass-bar sticky top-0 z-30 border-b border-line">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="ChartCortex home">
              <LogoLockup size={36} />
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden font-chivo text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
              Terminal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-teal/25 bg-teal/[0.06] px-3 py-1 font-mono text-[10px] text-accent sm:block">
              META MODELS
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-accent/40 hover:text-ink"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:h-[calc(100vh-68px)] lg:grid-cols-[220px_minmax(0,1fr)_400px]">
        <aside className="hidden min-h-0 lg:block">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,18,31,0.04),0_12px_32px_rgba(22,18,31,0.05)]">
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
                className="mt-2 w-full rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12px] text-ink outline-none placeholder:text-muted focus:border-accent/40"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {groups.map((group) => (
                <div key={group.name} className="mb-3">
                  <div className="px-2 pb-1 font-chivo text-[9px] uppercase tracking-[0.14em] text-muted">
                    {group.name}
                  </div>
                  {group.items.map((item) => {
                    const active = item.symbol === instrument;
                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => setInstrument(item.symbol)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors ${
                          active
                            ? "bg-teal/[0.08] text-accent"
                            : "text-ink hover:bg-surface-2"
                        }`}
                      >
                        <span className="font-mono text-[11.5px]">{item.symbol}</span>
                        <span className={`text-[10.5px] ${active ? "text-accent/70" : "text-muted"}`}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="border-t border-line px-3 py-2 text-[10px] leading-relaxed text-muted">
              Live OANDA feed. Select an asset, then a timeframe.
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(22,18,31,0.04),0_12px_32px_rgba(22,18,31,0.05)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-chivo text-[24px] font-bold uppercase tracking-[0.01em]">
                  {activeAsset.symbol}
                </span>
                <span className="text-[12px] text-muted">{activeAsset.name}</span>
                {last && (
                  <span className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-[18px] text-ink">
                      {formatPrice(last.close, instrument)}
                    </span>
                    <span
                      className={`text-[11px] ${
                        (series?.changePct ?? 0) >= 0 ? "text-up" : "text-down"
                      }`}
                    >
                      {formatSigned(series?.changePct ?? 0)}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-chivo text-[9.5px] font-semibold uppercase tracking-[0.12em] ${
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
                  {live ? "Live" : marketError ? "Offline" : "Connecting"}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {updatedAt ?? (marketError ? "no feed" : "connecting")}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    tf === timeframe
                      ? "bg-teal text-[#04120F]"
                      : "bg-surface-2 text-muted hover:text-ink"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="relative mt-3 flex-1 min-h-0 overflow-hidden rounded-xl border border-line bg-canvas">
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
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-muted">
                  {marketLoading ? "Loading live chart..." : "No data"}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] text-muted">
                {series
                  ? `${series.candles.length} candles · ${series.timeframe} · OANDA live`
                  : "loading"}
              </span>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={!series || busy || Boolean(marketError)}
                className="rounded-xl bg-teal px-6 py-3 text-[13px] font-semibold text-[#04120F] transition-colors hover:bg-[#9CFFE5] disabled:cursor-not-allowed disabled:opacity-60"
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

            {result && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] text-muted">
                <span className="truncate">sam {result.requests.sam ?? "n/a"}</span>
                <span className="truncate">muse {result.requests.muse ?? "n/a"}</span>
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
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(22,18,31,0.04),0_12px_32px_rgba(22,18,31,0.05)]">
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

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                  <EmptyStep n="02" title="The chart loads live" text="OANDA candles stream into the chart." />
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

            {plan && (
              <div className="pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-semibold ${biasTone[plan.bias] ?? biasTone.Neutral}`}>
                      {plan.bias}
                    </span>
                    <span className="rounded-md border border-line px-2 py-0.5 text-[10.5px] text-muted">
                      {plan.signalType}
                    </span>
                    <span className="rounded-md border border-line px-2 py-0.5 text-[10.5px] text-muted">
                      {plan.riskLevel} risk
                    </span>
                  </div>
                  <div className="min-w-[72px] text-right">
                    <div className="font-mono text-[26px] font-medium leading-none">
                      {plan.confidence}
                    </div>
                    <div className="font-chivo text-[9px] uppercase tracking-[0.12em] text-muted">
                      confidence
                    </div>
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-pink" style={{ width: `${plan.confidence}%` }} />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-relaxed text-ink/85">{plan.summary}</p>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <PriceCell
                    label="Entry"
                    value={`${formatPrice(plan.entryZone.low, plan.instrument)} - ${formatPrice(plan.entryZone.high, plan.instrument)}`}
                    tone="entry"
                  />
                  <PriceCell label="Stop" value={formatPrice(plan.stopLoss, plan.instrument)} tone="stop" />
                  {plan.takeProfits.map((tp) => (
                    <PriceCell
                      key={tp.label}
                      label={tp.label}
                      value={formatPrice(tp.price, plan.instrument)}
                      tone="target"
                    />
                  ))}
                </div>

                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[10px] text-muted">
                  <span>Risk to reward</span>
                  <span className="text-ink">{plan.riskReward.toFixed(2)}</span>
                </div>

                <ReportSection title="Structure">
                  <Row label="Trend" value={plan.trend} />
                  <Row label="Last BOS" value={plan.marketStructure.recentBos} />
                  <Row label="Last CHoCH" value={plan.marketStructure.recentChoch} />
                  <Row label="Liquidity" value={plan.marketStructure.liquidityNotes} />
                </ReportSection>

                <ReportSection title="Key levels">
                  <div className="grid grid-cols-2 gap-x-3">
                    <Row label="Support" value={formatPrice(plan.keyLevels.support, plan.instrument)} />
                    <Row label="Resistance" value={formatPrice(plan.keyLevels.resistance, plan.instrument)} />
                    <Row label="Confluent" value={formatPrice(plan.keyLevels.confluent, plan.instrument)} />
                    <Row label="Pivot" value={formatPrice(plan.keyLevels.pivot, plan.instrument)} />
                  </div>
                </ReportSection>

                <ReportSection title="Devil's advocate">
                  <Row label="Counter" value={plan.devilsAdvocate.counterThesis} />
                  <Row label="Invalidated if" value={plan.devilsAdvocate.invalidation} />
                  <Row label="Still valid" value={plan.devilsAdvocate.whyTakeIt} />
                </ReportSection>

                {plan.assumptions.length > 0 && (
                  <div className="mt-3 rounded-lg border border-pink/25 bg-pink/[0.05] p-2.5">
                    <div className="font-chivo text-[9px] uppercase tracking-[0.14em] text-pink">
                      Assumptions
                    </div>
                    <ul className="mt-1 space-y-0.5 text-[11px] leading-relaxed text-ink/70">
                      {plan.assumptions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-3 border-t border-line pt-2 text-[9.5px] leading-relaxed text-muted">
                  {plan.disclaimer}
                </p>
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
  const steps = [
    "Segmenting the live chart",
    "Measuring structure",
    "Writing the plan",
  ];
  return (
    <div className="pt-8">
      <div className="font-chivo text-[18px] font-bold leading-tight">
        Reading the live chart.
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        SAM 3.1 segments the chart, then Muse Spark writes the plan.
      </p>
      <div className="mt-6 space-y-3">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-3 text-[12px] text-muted">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal"
              style={{ animationDelay: `${index * 0.35}s` }}
            />
            {label}
          </div>
        ))}
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
      <div className="mt-4 font-mono text-[10px] text-muted">{elapsed.toFixed(1)}s</div>
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

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 border-t border-line pt-3">
      <div className="font-chivo text-[9px] uppercase tracking-[0.14em] text-muted">
        {title}
      </div>
      <dl className="mt-1.5 space-y-1.5 text-[11px]">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink/80">{value}</dd>
    </div>
  );
}

const priceTones: Record<string, string> = {
  entry: "border-teal/25 bg-teal/[0.06]",
  stop: "border-down/20 bg-down/[0.05]",
  target: "border-up/20 bg-up/[0.05]",
};

function PriceCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "entry" | "stop" | "target";
}) {
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${priceTones[tone]}`}>
      <div className="font-chivo text-[9px] uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11.5px] text-ink">{value}</div>
    </div>
  );
}
