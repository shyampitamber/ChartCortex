"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 5,
  }).format(value);
}

const biasStyles: Record<string, string> = {
  Bullish: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  Bearish: "bg-rose-400/15 text-rose-300 border-rose-400/30",
  Neutral: "bg-slate-400/15 text-slate-300 border-slate-400/30",
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
    ctx.fillStyle = "rgba(94, 234, 212, 0.10)";
    ctx.strokeStyle = "rgba(94, 234, 212, 0.55)";
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
          ? "rgba(251, 191, 36, 0.85)"
          : "rgba(56, 189, 248, 0.85)";
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
      if (!response.ok) {
        throw new Error(payload.error || "Analysis failed");
      }
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setStatus("idle");
    }
  }, [image, instrument, timeframe]);

  const plan = result?.plan;
  const busy = status === "analysing";

  return (
    <div className="min-h-screen bg-[#07090c] text-slate-200">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-teal-300/30 bg-teal-300/10 text-sm font-bold text-teal-300">
              CX
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-white">
                ChartCorex
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Chart image intelligence
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            SAM 3.1 + Muse Spark
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Instrument
              </label>
              <input
                list="instruments"
                value={instrument}
                onChange={(event) => setInstrument(event.target.value.toUpperCase())}
                className="w-28 rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-sm text-white outline-none focus:border-teal-300/50"
              />
              <datalist id="instruments">
                {INSTRUMENTS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <label className="ml-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(event) => setTimeframe(event.target.value)}
                className="rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-sm text-white outline-none focus:border-teal-300/50"
              >
                {TIMEFRAMES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
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
                dragging ? "border-teal-300/70 bg-teal-300/5" : "border-white/15"
              } ${image ? "" : "grid h-64 cursor-pointer place-items-center"}`}
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
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-sm font-medium text-slate-400">
                      Drop a chart screenshot
                    </span>
                    <span className="text-xs text-slate-500">
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
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {image ? (
                  <>
                    <span className="font-mono">
                      {image.width} x {image.height}
                    </span>
                    <span className="truncate max-w-[180px]">{image.name}</span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={useSample}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-teal-300/40 hover:text-teal-200"
                  >
                    Use sample chart
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={showOverlay}
                    onChange={(event) => setShowOverlay(event.target.checked)}
                    className="accent-teal-300"
                  />
                  Segmentation overlay
                </label>
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={!image || busy}
                  className="rounded-md bg-teal-300 px-4 py-2 text-sm font-semibold text-[#04211d] transition-colors hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? `Analysing ${elapsed.toFixed(1)}s` : "Scan chart"}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Segmentation
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat
                  label="Chart panel"
                  value={result.segmentation.region ? "segmented" : "whole image"}
                />
                <Stat label="Candles used" value={String(result.geometry.candleCount)} />
                <Stat label="Levels" value={String(result.geometry.levels.length)} />
                <Stat
                  label="SAM time"
                  value={`${(result.timings.segmentMs / 1000).toFixed(2)}s`}
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Pipeline
            </div>
            <ol className="space-y-2 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="w-20 shrink-0 font-mono text-teal-300">SAM 3.1</span>
                <span>Segments the chart panel and visible objects.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-20 shrink-0 font-mono text-teal-300">Geometry</span>
                <span>Recovers every candle from the pixels and clusters levels.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-20 shrink-0 font-mono text-teal-300">Muse Spark</span>
                <span>Reads the chart and returns the constrained plan.</span>
              </li>
            </ol>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          {!plan && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="text-lg font-semibold text-white">One image, one structure</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Upload a live chart screenshot. SAM 3.1 segments the chart panel,
                the geometry layer recovers every candle and level in pixel space,
                then Muse Spark reads the image and returns entry, stop loss,
                three take profits, confidence and the reasoning behind them.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-teal-300">01</span>
                  Segmentation maps the chart panel and its objects.
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-300">02</span>
                  Candle geometry is extracted deterministically, so the levels are
                  measured rather than guessed.
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-300">03</span>
                  The confidence engine scores only what is visible.
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-300">04</span>
                  Decision support only. No execution, no client funds.
                </li>
              </ul>
            </div>
          )}

          {plan && (
            <>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      biasStyles[plan.bias] ?? biasStyles.Neutral
                    }`}
                  >
                    {plan.bias}
                  </span>
                  <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                    {plan.signalType}
                  </span>
                  <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                    Risk {plan.riskLevel}
                  </span>
                  <span className="ml-auto flex items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-semibold leading-none text-white">
                      {plan.confidence}
                    </span>
                    <span className="text-xs text-slate-500">confidence</span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-slate-300">{plan.instrument}</span>
                  <span>/</span>
                  <span className="font-mono text-slate-300">{plan.timeframe}</span>
                  <span>/</span>
                  <span>{plan.chartType}</span>
                  {!plan.priceScaleVisible && (
                    <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-amber-200">
                      price axis unreadable
                    </span>
                  )}
                  {result?.mocked && (
                    <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-amber-200">
                      mock data
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">{plan.summary}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <PriceCell
                    label="Entry zone"
                    value={`${formatPrice(plan.entryZone.low)} - ${formatPrice(
                      plan.entryZone.high
                    )}`}
                    tone="entry"
                  />
                  <PriceCell label="Stop loss" value={formatPrice(plan.stopLoss)} tone="stop" />
                  {plan.takeProfits.map((tp) => (
                    <PriceCell
                      key={tp.label}
                      label={tp.label}
                      value={formatPrice(tp.price)}
                      tone="target"
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-400">
                  <span>R multiple</span>
                  <span className="text-slate-200">{plan.riskReward.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Structure
                    </div>
                    <dl className="mt-2 space-y-2 text-xs">
                      <Row label="Trend" value={plan.trend} />
                      <Row label="Last BOS" value={plan.marketStructure.recentBos} />
                      <Row label="Last CHoCH" value={plan.marketStructure.recentChoch} />
                      <Row label="Liquidity" value={plan.marketStructure.liquidityNotes} />
                    </dl>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Key levels
                    </div>
                    <dl className="mt-2 space-y-2 text-xs">
                      <Row label="Support" value={formatPrice(plan.keyLevels.support)} />
                      <Row label="Resistance" value={formatPrice(plan.keyLevels.resistance)} />
                      <Row label="Confluent" value={formatPrice(plan.keyLevels.confluent)} />
                      <Row label="Pivot" value={formatPrice(plan.keyLevels.pivot)} />
                    </dl>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Devil&apos;s advocate
                </div>
                <dl className="mt-2 space-y-2 text-xs">
                  <Row label="Counter" value={plan.devilsAdvocate.counterThesis} />
                  <Row label="Invalidated if" value={plan.devilsAdvocate.invalidation} />
                  <Row label="Still valid" value={plan.devilsAdvocate.whyTakeIt} />
                </dl>
                <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                  <span className="text-slate-500">Management: </span>
                  {plan.tradeManagement}
                </div>
              </div>

              {plan.assumptions.length > 0 && (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-amber-200/80">
                    Assumptions
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-amber-100/70">
                    {plan.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-4 py-3 text-[11px] text-slate-500">
                <span className="font-mono">
                  {result?.models.sam} + {result?.models.muse}
                </span>
                <span className="font-mono">
                  segment {(result?.timings.segmentMs ?? 0) / 1000}s / reason{" "}
                  {(result?.timings.reasonMs ?? 0) / 1000}s / total{" "}
                  {(result?.timings.totalMs ?? 0) / 1000}s
                </span>
              </div>

              <p className="px-1 text-[11px] leading-relaxed text-slate-600">
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
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="font-mono text-sm text-slate-200">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-300">{value}</dd>
    </div>
  );
}

const tones: Record<string, string> = {
  entry: "border-teal-300/25 bg-teal-300/[0.06]",
  stop: "border-rose-400/25 bg-rose-400/[0.06]",
  target: "border-emerald-400/20 bg-emerald-400/[0.05]",
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
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-white">{value}</div>
    </div>
  );
}
