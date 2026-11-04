"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type CandlestickData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import type { MarketCandle } from "@/lib/market/oanda";

export type LiveChartHandle = {
  snapshot: () => { dataUrl: string; width: number; height: number } | null;
};

type Level = { price: number; type: "support" | "resistance" };
type PlanLines = {
  entryLow: number;
  entryHigh: number;
  stop: number;
  targets: number[];
};

type Theme = "dark" | "light";

function precisionFor(instrument: string): number {
  const s = instrument.toUpperCase();
  if (/JPY|XAU|NAS|US30|US500|GER40|WTI|NATGAS/.test(s)) return 2;
  if (/XAG/.test(s)) return 3;
  return 5;
}

const palette: Record<Theme, {
  background: string;
  text: string;
  grid: string;
  border: string;
  crosshair: string;
  label: string;
  up: string;
  down: string;
  support: string;
  resistance: string;
  entry: string;
  target: string;
  stop: string;
}> = {
  dark: {
    background: "#070B10",
    text: "#8FA3A6",
    grid: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    crosshair: "rgba(129,255,217,0.35)",
    label: "#0D141C",
    up: "#81FFD9",
    down: "#F355D0",
    support: "rgba(129,255,217,0.55)",
    resistance: "rgba(243,85,208,0.55)",
    entry: "rgba(110,154,255,0.85)",
    target: "rgba(74,222,128,0.75)",
    stop: "rgba(251,113,133,0.8)",
  },
  light: {
    background: "#FFFFFF",
    text: "#5F6F76",
    grid: "rgba(10,20,32,0.05)",
    border: "rgba(10,20,32,0.1)",
    crosshair: "rgba(11,122,99,0.45)",
    label: "#0B1620",
    up: "#0E9F6E",
    down: "#D92D7A",
    support: "rgba(11,122,99,0.6)",
    resistance: "rgba(217,45,122,0.55)",
    entry: "rgba(16,91,255,0.75)",
    target: "rgba(14,159,110,0.7)",
    stop: "rgba(224,36,74,0.7)",
  },
};

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function formatStamp(time: number) {
  const iso = new Date(time * 1000).toISOString();
  return `${iso.slice(5, 10).replace("-", "/")} ${iso.slice(11, 16)} UTC`;
}

type Props = {
  instrument: string;
  timeframe: string;
  candles: MarketCandle[];
  levels?: Level[];
  plan?: PlanLines | null;
  scanning?: boolean;
  height?: number;
};

const LiveChart = forwardRef<LiveChartHandle, Props>(function LiveChart(
  { instrument, timeframe, candles, levels, plan, scanning = false, height = 440 },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [hover, setHover] = useState<CandlestickData<Time> | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      snapshot() {
        const chart = chartRef.current;
        if (!chart) return null;
        const canvas = chart.takeScreenshot();
        const maxEdge = 1600;
        const scale = Math.min(
          1,
          maxEdge / Math.max(canvas.width, canvas.height)
        );
        const out = document.createElement("canvas");
        out.width = Math.round(canvas.width * scale);
        out.height = Math.round(canvas.height * scale);
        const ctx = out.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(canvas, 0, 0, out.width, out.height);
        return {
          dataUrl: out.toDataURL("image/jpeg", 0.9),
          width: out.width,
          height: out.height,
        };
      },
    }),
    []
  );

  useEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const tone = palette[theme];
    const precision = precisionFor(instrument);
    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || height,
      layout: {
        background: { type: ColorType.Solid, color: tone.background },
        textColor: tone.text,
        fontFamily: "Chivo, ui-sans-serif, sans-serif",
        fontSize: 11,
        attributionLogo: false,
      },
      localization: {
        timeFormatter: (time: number) =>
          `${new Date(time * 1000).toISOString().slice(11, 16)} UTC`,
      },
      grid: {
        vertLines: { color: tone.grid },
        horzLines: { color: tone.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: tone.crosshair,
          style: LineStyle.Dashed,
          labelBackgroundColor: tone.label,
        },
        horzLine: {
          color: tone.crosshair,
          style: LineStyle.Dashed,
          labelBackgroundColor: tone.label,
        },
      },
      rightPriceScale: {
        borderColor: tone.border,
        scaleMargins: { top: 0.08, bottom: 0.1 },
      },
      timeScale: {
        borderColor: tone.border,
        timeVisible: timeframe !== "D1",
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 9,
        shiftVisibleRangeOnNewBar: true,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: tone.up,
      downColor: tone.down,
      borderVisible: false,
      wickUpColor: tone.up,
      wickDownColor: tone.down,
      priceFormat: {
        type: "price",
        precision,
        minMove: 1 / 10 ** precision,
      },
    });

    const onCrosshair = (param: MouseEventParams<Time>) => {
      const bar = param.seriesData.get(series) as
        | CandlestickData<Time>
        | undefined;
      setHover(bar ?? null);
    };
    chart.subscribeCrosshairMove(onCrosshair);

    chartRef.current = chart;
    candleRef.current = series;

    const observer = new ResizeObserver(() => {
      chart.applyOptions({
        width: el.clientWidth,
        height: el.clientHeight || height,
      });
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.unsubscribeCrosshairMove(onCrosshair);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      priceLinesRef.current = [];
    };
  }, [height, instrument, timeframe, theme]);

  useEffect(() => {
    if (!candleRef.current || !candles.length) return;
    const precision = precisionFor(instrument);

    candleRef.current.applyOptions({
      priceFormat: {
        type: "price",
        precision,
        minMove: 1 / 10 ** precision,
      },
    });

    candleRef.current.setData(
      candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
    );

    chartRef.current?.timeScale().fitContent();
  }, [candles, instrument, theme]);

  useEffect(() => {
    const series = candleRef.current;
    if (!series) return;

    for (const line of priceLinesRef.current) series.removePriceLine(line);
    priceLinesRef.current = [];

    const tone = palette[theme];
    const add = (
      price: number,
      color: string,
      title: string,
      style: LineStyle = LineStyle.Dashed,
      axisLabelVisible = true
    ) => {
      if (!Number.isFinite(price)) return;
      priceLinesRef.current.push(
        series.createPriceLine({
          price,
          color,
          lineWidth: 1,
          lineStyle: style,
          axisLabelVisible,
          title,
        })
      );
    };

    for (const level of levels ?? []) {
      add(
        level.price,
        level.type === "support" ? tone.support : tone.resistance,
        level.type === "support" ? "support" : "resistance",
        LineStyle.Dotted
      );
    }

    if (plan) {
      add(plan.entryLow, tone.entry, "entry", LineStyle.Solid);
      add(plan.entryHigh, tone.entry, "", LineStyle.Solid, false);
      add(plan.stop, tone.stop, "stop", LineStyle.Solid);
      plan.targets.forEach((target, index) => {
        add(target, tone.target, `tp${index + 1}`, LineStyle.Dashed);
      });
    }
  }, [levels, plan, theme, candles]);

  const close = candles.length ? candles[candles.length - 1].close : null;
  const hoverChange = hover && close !== null ? hover.close - close : null;
  const precision = precisionFor(instrument);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {hover && (
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-canvas/85 px-2.5 py-1.5 font-mono text-[10px] text-muted backdrop-blur">
          <span className="text-ink/80">
            {typeof hover.time === "number" ? formatStamp(hover.time) : "—"}
          </span>
          <span>
            O <span className="text-ink/80">{hover.open.toFixed(precision)}</span>
          </span>
          <span>
            H <span className="text-ink/80">{hover.high.toFixed(precision)}</span>
          </span>
          <span>
            L <span className="text-ink/80">{hover.low.toFixed(precision)}</span>
          </span>
          <span>
            C{" "}
            <span className={hoverChange !== null && hoverChange < 0 ? "text-down" : "text-up"}>
              {hover.close.toFixed(precision)}
            </span>
          </span>
        </div>
      )}

      {scanning && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <div className="scan-sweep absolute inset-x-0 h-24" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(129,255,217,0.05),transparent_35%)]" />

          <div className="absolute inset-0 grid place-items-center">
            <div className="relative grid place-items-center">
              <span className="absolute h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(16,91,255,0.4),rgba(129,255,217,0.16)_48%,transparent_70%)] blur-2xl" />
              <svg
                viewBox="0 0 200 200"
                className="absolute h-60 w-60"
                aria-hidden
              >
                <defs>
                  <linearGradient id="brainRingA" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#81FFD9" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#81FFD9" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="brainRingB" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F355D0" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#F355D0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g className="brain-orbit">
                  <ellipse
                    cx="100"
                    cy="100"
                    rx="88"
                    ry="34"
                    transform="rotate(-20 100 100)"
                    fill="none"
                    stroke="url(#brainRingA)"
                    strokeWidth="1.4"
                    strokeDasharray="110 300"
                  />
                  <ellipse
                    cx="100"
                    cy="100"
                    rx="88"
                    ry="34"
                    transform="rotate(150 100 100)"
                    fill="none"
                    stroke="url(#brainRingB)"
                    strokeWidth="1.1"
                    strokeDasharray="80 330"
                  />
                </g>
                <g className="brain-orbit-reverse">
                  <ellipse
                    cx="100"
                    cy="100"
                    rx="70"
                    ry="70"
                    fill="none"
                    stroke="rgba(129,255,217,0.18)"
                    strokeWidth="1"
                    strokeDasharray="2 9"
                  />
                </g>
              </svg>
              <Image
                src="/brand/mark-t-64.png"
                alt=""
                width={80}
                height={80}
                className="brain-heartbeat relative h-24 w-24 rounded-2xl drop-shadow-[0_0_30px_rgba(129,255,217,0.55)]"
              />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-lg border border-line bg-canvas/80 px-3 py-1.5 font-chivo text-[9px] font-bold uppercase tracking-[0.18em] text-accent backdrop-blur">
              Reading the chart
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default LiveChart;
