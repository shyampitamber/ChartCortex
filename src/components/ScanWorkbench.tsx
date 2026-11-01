"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoLockup } from "@/components/Logo";
import type { AnalyzeResponse } from "@/lib/types";

const MAX_EDGE = 1700;
const TIMEFRAMES = ["M5", "M15", "M30", "H1", "H4", "D1"];
const INSTRUMENTS = ["XAUUSD", "EURUSD", "GBPUSD", "NAS100", "BTCUSD", "US30"];

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
  Bullish: "border-up/30 bg-up/10 text-up",
  Bearish: "border-down/30 bg-down/10 text-down",
  Neutral: "border-line bg-surface-2 text-muted",
};

export default function ScanWorkbench() {
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [instrument, setInstrument] = useState("XAUUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "analysing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [dragging, setDragging] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "idle") return;
    const started = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed((Date.now() - started) / 1000);
    }, 100);
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

  const useSample = useCallback(async () => {
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
    ctx.fillStyle = "rgba(238, 236, 239, 0.03)";
    ctx.strokeStyle = "rgba(238, 236, 239, 0.22)";
    for (const box of result.geometry.boxes) {
      const x = box.x * width;
      const y = box.y * height;
      const w = box.w * width;
      const h = box.h * height;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    }

    for (const level of result.geometry.levels) {
      const y = level.y * height;
      ctx.beginPath();
      ctx.setLineDash([line * 6, line * 4]);
      ctx.strokeStyle =
        level.type === "resistance"
          ? "rgba(243, 85, 208, 0.9)"
          : "rgba(168, 148, 255, 0.9)";
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
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <LogoLockup />
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
              Chart image intelligence
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-md border border-violet/40 bg-violet/10 px-2.5 py-1 font-mono text-[10px] tracking-wide text-violet-soft sm:block">
              META MODELS
            </span>
            {(image || result) && (
              <button
                type="button"
                onClick={reset}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-violet/50 hover:text-ink"
              >
                New scan
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-4 px-5 py-5 lg:grid-cols-[1.12fr_0.88fr]">
        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  Instrument
                </span>
                <input
                  list="instruments"
                  value={instrument}
                  onChange={(event) => setInstrument(event.target.value.toUpperCase())}
                  className="w-32 rounded-md border border-line bg-canvas px-2.5 py-1.5 font-mono text-sm text-ink outline-none transition-colors focus:border-violet-soft/60"
                />
                <datalist id="instruments">
                  {INSTRUMENTS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  Timeframe
                </span>
                <select
                  value={timeframe}
                  onChange={(event) => setTimeframe(event.target.value)}
                  className="w-24 rounded-md border border-line bg-canvas px-2.5 py-1.5 font-mono text-sm text-ink outline-none transition-colors focus:border-violet-soft/60"
                >
                  {TIMEFRAMES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <div className="ml-auto flex items-center gap-3">
                {image ? (
                  <span className="font-mono text-[11px] text-muted">
                    {image.width} x {image.height}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={useSample}
                    className="rounded-md border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-violet/50 hover:text-ink"
                  >
                    Use sample chart
                  </button>
                )}
              </div>
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
              className={`relative overflow-hidden rounded-lg border border-dashed transition-colors ${
                dragging ? "border-violet-soft/70 bg-violet/10" : "border-line"
              } ${image ? "bg-canvas" : "grid h-[300px] cursor-pointer place-items-center bg-canvas"}`}
            >
              {image ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={image.dataUrl}
                    alt="Uploaded chart"
                    onLoad={drawOverlay}
                    className="block h-auto w-full"
                  />
                  <canvas
                    ref={canvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-sm font-medium text-ink">
                    Drop a chart screenshot
                  </span>
                  <span className="text-xs text-muted">
                    PNG, JPEG or WebP, or click to browse
                  </span>
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
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(event) => setShowOverlay(event.target.checked)}
                  className="h-3.5 w-3.5 accent-violet"
                />
                Show segmentation
              </label>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={!image || busy}
                className="rounded-md bg-violet px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#6a45ff] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? `Analysing ${elapsed.toFixed(1)}s` : "Scan chart"}
              </button>
            </div>
          </div>

          {result && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  Extraction
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {result.mocked ? "mock run" : "live"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  label="Chart panel"
                  value={result.segmentation.region ? "segmented" : "full image"}
                />
                <Stat label="Candles" value={String(result.geometry.candleCount)} />
                <Stat label="Levels" value={String(result.geometry.levels.length)} />
                <Stat
                  label="Vision"
                  value={`${(result.timings.segmentMs / 1000).toFixed(2)}s`}
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2.5 text-[10px] uppercase tracking-[0.16em] text-muted">
              Pipeline
            </div>
            <ol className="space-y-2.5 text-xs">
              <PipelineRow step="01" model="SAM 3.1" text="Segments the chart panel and its objects." />
              <PipelineRow step="02" model="Geometry" text="Measures every candle and clusters the levels." />
              <PipelineRow step="03" model="Muse Spark" text="Reads the chart and returns the constrained plan." />
            </ol>
          </div>

          {error && (
            <div className="rounded-lg border border-down/30 bg-down/10 px-4 py-3 text-sm text-down">
              {error}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          {!plan && (
            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">
                Upload a chart.
                <br />
                Get the structure.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Entry, stop, three targets and the reasoning, measured from the image
                in front of you rather than inferred from a data feed.
              </p>
              <div className="mt-6 space-y-4">
                <EmptyStep n="01" title="Read the chart" text="The vision layer segments the panel and measures every candle." />
                <EmptyStep n="02" title="Score what is visible" text="Confidence is built from visible evidence only. Missing panels score zero." />
                <EmptyStep n="03" title="Return one plan" text="One bias, one entry zone, three targets, written rationale." />
              </div>
              <p className="mt-6 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
                Decision support and education only. Not financial advice. No execution
                and no client funds.
              </p>
            </div>
          )}

          {plan && (
            <>
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        biasTone[plan.bias] ?? biasTone.Neutral
                      }`}
                    >
                      {plan.bias}
                    </span>
                    <span className="rounded-md border border-line px-2.5 py-1 text-xs text-muted">
                      {plan.signalType}
                    </span>
                    <span className="rounded-md border border-line px-2.5 py-1 text-xs text-muted">
                      Risk {plan.riskLevel}
                    </span>
                  </div>
                  <div className="min-w-[104px] text-right">
                    <div className="font-mono text-[30px] font-medium leading-none">
                      {plan.confidence}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                      confidence
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-pink"
                        style={{ width: `${plan.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
                  <span className="text-ink">{plan.instrument}</span>
                  <span>/</span>
                  <span className="text-ink">{plan.timeframe}</span>
                  <span>/</span>
                  <span>{plan.chartType}</span>
                  {!plan.priceScaleVisible && (
                    <span className="rounded border border-pink/30 bg-pink/10 px-1.5 py-0.5 text-pink">
                      price axis unreadable
                    </span>
                  )}
                  {result?.mocked && (
                    <span className="rounded border border-pink/30 bg-pink/10 px-1.5 py-0.5 text-pink">
                      mock data
                    </span>
                  )}
                </div>

                <p className="mt-3.5 text-sm leading-relaxed text-ink/90">{plan.summary}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <PriceCell
                    label="Entry zone"
                    value={`${formatPrice(plan.entryZone.low)} - ${formatPrice(plan.entryZone.high)}`}
                    tone="entry"
                  />
                  <PriceCell label="Stop" value={formatPrice(plan.stopLoss)} tone="stop" />
                  {plan.takeProfits.map((tp) => (
                    <PriceCell
                      key={tp.label}
                      label={tp.label}
                      value={formatPrice(tp.price)}
                      tone="target"
                    />
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-muted">
                  <span>Risk to reward</span>
                  <span className="text-ink">{plan.riskReward.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <SectionLabel>Structure</SectionLabel>
                    <dl className="mt-2 space-y-2.5 text-xs">
                      <Row label="Trend" value={plan.trend} />
                      <Row label="Last BOS" value={plan.marketStructure.recentBos} />
                      <Row label="Last CHoCH" value={plan.marketStructure.recentChoch} />
                      <Row label="Liquidity" value={plan.marketStructure.liquidityNotes} />
                    </dl>
                  </div>
                  <div>
                    <SectionLabel>Key levels</SectionLabel>
                    <dl className="mt-2 space-y-2.5 text-xs">
                      <Row label="Support" value={formatPrice(plan.keyLevels.support)} />
                      <Row label="Resistance" value={formatPrice(plan.keyLevels.resistance)} />
                      <Row label="Confluent" value={formatPrice(plan.keyLevels.confluent)} />
                      <Row label="Pivot" value={formatPrice(plan.keyLevels.pivot)} />
                    </dl>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <SectionLabel>Devil&apos;s advocate</SectionLabel>
                <dl className="mt-2 space-y-2.5 text-xs">
                  <Row label="Counter" value={plan.devilsAdvocate.counterThesis} />
                  <Row label="Invalidated if" value={plan.devilsAdvocate.invalidation} />
                  <Row label="Still valid" value={plan.devilsAdvocate.whyTakeIt} />
                </dl>
                <div className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
                  <span className="text-muted">Management: </span>
                  <span className="text-ink/85">{plan.tradeManagement}</span>
                </div>
              </div>

              {plan.assumptions.length > 0 && (
                <div className="rounded-xl border border-pink/25 bg-pink/[0.05] p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-pink">
                    Assumptions
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-ink/75">
                    {plan.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3 font-mono text-[10px] text-muted">
                <span>
                  {result?.models.sam} + {result?.models.muse}
                </span>
                <span>
                  vision {(result?.timings.segmentMs ?? 0) / 1000}s / reason{" "}
                  {(result?.timings.reasonMs ?? 0) / 1000}s / total{" "}
                  {(result?.timings.totalMs ?? 0) / 1000}s
                </span>
              </div>

              <p className="px-1 text-[10.5px] leading-relaxed text-muted">
                {plan.disclaimer}
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 text-ink/85">{value}</dd>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
      {children}
    </div>
  );
}

function PipelineRow({
  step,
  model,
  text,
}: {
  step: string;
  model: string;
  text: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="font-mono text-[10px] text-violet-soft">{step}</span>
      <span className="w-[86px] shrink-0 font-mono text-[11px] text-ink">{model}</span>
      <span className="text-muted">{text}</span>
    </li>
  );
}

function EmptyStep({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 font-mono text-[10px] text-violet-soft">{n}</span>
      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-muted">{text}</div>
      </div>
    </div>
  );
}

const priceTones: Record<string, string> = {
  entry: "border-violet/30 bg-violet/10",
  stop: "border-down/25 bg-down/[0.07]",
  target: "border-up/20 bg-up/[0.06]",
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
    <div className={`rounded-lg border px-3 py-2 ${priceTones[tone]}`}>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-ink">{value}</div>
    </div>
  );
}
