"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { AnalyzeResponse } from "@/lib/types";

const MAX_EDGE = 1700;
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
    name: "Crypto",
    items: [
      { symbol: "BTCUSD", name: "Bitcoin" },
      { symbol: "ETHUSD", name: "Ethereum" },
      { symbol: "SOLUSD", name: "Solana" },
    ],
  },
];

const ALL_ASSETS = ASSET_GROUPS.flatMap((group) => group.items);

type PreparedImage = {
  dataUrl: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  name: string;
};

async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  return {
    dataUrl,
    base64: dataUrl.split(",")[1] ?? "",
    mimeType: "image/jpeg",
    width,
    height,
    name: file.name,
  };
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 5 }).format(value);
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
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "analysing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [dragging, setDragging] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (status === "idle") return;
    const started = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 100);
    return () => window.clearInterval(timer);
  }, [status]);

  const acceptFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    try {
      setStatus("reading");
      const prepared = await prepareImage(file);
      setImage(prepared);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that image");
    } finally {
      setStatus("idle");
    }
  }, []);

  const loadSample = useCallback(async () => {
    const response = await fetch("/sample-chart.png");
    const blob = await response.blob();
    await acceptFile(new File([blob], "sample-chart.png", { type: "image/png" }));
  }, [acceptFile]);

  const drawOverlay = useCallback(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !result) return;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (!showOverlay) return;

    const line = Math.max(1, Math.round(width * 0.0012));
    ctx.lineWidth = line;
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    for (const box of result.geometry.boxes) {
      ctx.fillRect(box.x * width, box.y * height, box.w * width, box.h * height);
      ctx.strokeRect(box.x * width, box.y * height, box.w * width, box.h * height);
    }

    for (const level of result.geometry.levels) {
      const y = level.y * height;
      ctx.beginPath();
      ctx.setLineDash([line * 6, line * 4]);
      ctx.strokeStyle =
        level.type === "resistance"
          ? "rgba(243, 85, 208, 0.95)"
          : "rgba(138, 107, 255, 0.95)";
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [result, showOverlay]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const runAnalysis = useCallback(async () => {
    if (!image) return;
    setStatus("analysing");
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: image.base64,
          mimeType: image.mimeType,
          imageWidth: image.width,
          imageHeight: image.height,
          instrument,
          timeframe,
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
  }, [image, instrument, timeframe]);

  const reset = useCallback(() => {
    setImage(null);
    setResult(null);
    setError(null);
    setStatus("idle");
  }, []);

  const plan = result?.plan;
  const busy = status !== "idle";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_15%_-10%,rgba(85,47,246,0.14),transparent_55%),radial-gradient(ellipse_at_85%_-20%,rgba(243,85,208,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="ChartCortex home">
              <LogoLockup size={30} />
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
              Terminal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-accent/30 bg-teal/[0.06] px-3 py-1 font-mono text-[10px] text-accent sm:block">
              META MODELS
            </span>
            <ThemeToggle />
            {(image || result) && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-accent/40 hover:text-ink"
              >
                New scan
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[232px_minmax(0,1fr)_392px]">
        <aside className="hidden lg:block">
          <div className="sticky top-[72px] flex max-h-[calc(100vh-88px)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,18,31,0.04),0_12px_32px_rgba(22,18,31,0.05)]">
            <div className="border-b border-line p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Assets</span>
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
                  <div className="px-2 pb-1 text-[9.5px] uppercase tracking-[0.14em] text-muted">
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
              Select an asset, then upload its chart.
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(22,18,31,0.04),0_12px_32px_rgba(22,18,31,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[22px] font-semibold tracking-[-0.01em]">
                  {activeAsset.symbol}
                </span>
                <span className="text-[12px] text-muted">{activeAsset.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={instrument}
                  onChange={(event) => setInstrument(event.target.value)}
                  className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12px] text-ink outline-none lg:hidden"
                >
                  {ALL_ASSETS.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-accent/40"
                >
                  Upload chart
                </button>
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
              <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-up" />
                Uploaded screenshot
              </span>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) void acceptFile(file);
              }}
              onClick={() => {
                if (!image) inputRef.current?.click();
              }}
              className={`relative mt-3 aspect-[16/10] overflow-hidden rounded-xl border transition-colors ${
                dragging ? "border-teal/60 bg-teal/[0.04]" : "border-line bg-surface-2"
              } ${image ? "" : "cursor-pointer"}`}
            >
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={image.dataUrl}
                    alt="Uploaded chart"
                    onLoad={drawOverlay}
                    className="h-full w-full object-contain"
                  />
                  <canvas
                    ref={canvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <div className="font-display text-[15px] font-semibold text-ink">
                    Drop a chart screenshot
                  </div>
                  <div className="text-[11.5px] text-muted">
                    PNG, JPEG or WebP, or click to browse
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void loadSample();
                    }}
                    className="mt-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-[11.5px] text-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    Use sample chart
                  </button>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void acceptFile(file);
                  event.target.value = "";
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted">
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(event) => setShowOverlay(event.target.checked)}
                  className="h-3.5 w-3.5 accent-teal"
                />
                Show segmentation
              </label>
              <span className="font-mono text-[10px] text-muted">
                {image ? `${image.width} x ${image.height}` : "no image"}
              </span>
            </div>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={!image || busy}
              className="mt-3 w-full rounded-xl bg-teal px-5 py-3 text-[13px] font-semibold text-[#04120F] transition-colors hover:bg-[#9CFFE5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? `Analysing ${elapsed.toFixed(1)}s` : "Scan chart"}
            </button>

            {result && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[9.5px] text-muted">
                <span>
                  vision {(result.timings.segmentMs / 1000).toFixed(2)}s / reason{" "}
                  {(result.timings.reasonMs / 1000).toFixed(2)}s / total{" "}
                  {(result.timings.totalMs / 1000).toFixed(2)}s
                </span>
                <span className="truncate">
                  {result.models.sam} + {result.models.muse}
                </span>
              </div>
            )}

            {result && (
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] text-muted">
                <span className="truncate">sam {result.requests.sam ?? "mock"}</span>
                <span className="truncate">muse {result.requests.muse ?? "mock"}</span>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-down/25 bg-down/[0.06] px-3 py-2 text-[12px] text-down">
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SmallStat
              label="Chart panel"
              value={result ? (result.segmentation.region ? "segmented" : "full image") : "pending"}
            />
            <SmallStat
              label="Candles"
              value={result ? String(result.geometry.candleCount) : "pending"}
            />
            <SmallStat
              label="Levels"
              value={result ? String(result.geometry.levels.length) : "pending"}
            />
          </div>
        </section>

        <section className="flex min-w-0 flex-col">
          <div className="flex-1 rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(22,18,31,0.04),0_12px_32px_rgba(22,18,31,0.05)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
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

            {!plan && (
              <div className="flex h-full flex-col justify-center py-10">
                <div className="font-display text-[18px] font-semibold leading-tight">
                  The report writes itself here.
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  One bias, one entry zone, a stop, three targets and the reasoning.
                  Nothing runs until you press scan.
                </p>
                <ol className="mt-5 space-y-3">
                  <EmptyStep n="01" title="Pick the asset" text="Set the instrument and timeframe on the left." />
                  <EmptyStep n="02" title="Upload the chart" text="Use a screenshot of the chart in front of you." />
                  <EmptyStep n="03" title="Scan" text="The vision layer measures it, the model reasons over it." />
                </ol>
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
                    <div className="text-[9px] uppercase tracking-[0.12em] text-muted">
                      confidence
                    </div>
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-pink" style={{ width: `${plan.confidence}%` }} />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-relaxed text-ink/85">{plan.summary}</p>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <PriceCell label="Entry" value={`${formatPrice(plan.entryZone.low)} - ${formatPrice(plan.entryZone.high)}`} tone="entry" />
                  <PriceCell label="Stop" value={formatPrice(plan.stopLoss)} tone="stop" />
                  {plan.takeProfits.map((tp) => (
                    <PriceCell key={tp.label} label={tp.label} value={formatPrice(tp.price)} tone="target" />
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
                    <Row label="Support" value={formatPrice(plan.keyLevels.support)} />
                    <Row label="Resistance" value={formatPrice(plan.keyLevels.resistance)} />
                    <Row label="Confluent" value={formatPrice(plan.keyLevels.confluent)} />
                    <Row label="Pivot" value={formatPrice(plan.keyLevels.pivot)} />
                  </div>
                </ReportSection>

                <ReportSection title="Devil's advocate">
                  <Row label="Counter" value={plan.devilsAdvocate.counterThesis} />
                  <Row label="Invalidated if" value={plan.devilsAdvocate.invalidation} />
                  <Row label="Still valid" value={plan.devilsAdvocate.whyTakeIt} />
                </ReportSection>

                {plan.assumptions.length > 0 && (
                  <div className="mt-3 rounded-lg border border-pink/25 bg-pink/[0.05] p-2.5">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-pink">
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
        </section>
      </main>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.12em] text-muted">{label}</div>
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
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted">{title}</div>
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
  entry: "border-accent/30 bg-teal/[0.06]",
  stop: "border-down/20 bg-down/[0.05]",
  target: "border-up/20 bg-up/[0.05]",
};

function PriceCell({ label, value, tone }: { label: string; value: string; tone: "entry" | "stop" | "target" }) {
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${priceTones[tone]}`}>
      <div className="text-[9px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-[11.5px] text-ink">{value}</div>
    </div>
  );
}
