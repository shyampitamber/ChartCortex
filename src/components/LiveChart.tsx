"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { MarketCandle } from "@/lib/market/oanda";

export type LiveChartHandle = {
  snapshot: () => { dataUrl: string; width: number; height: number } | null;
};

function precisionFor(instrument: string): number {
  const s = instrument.toUpperCase();
  if (/JPY|XAU|NAS|US30|US500|GER40|WTI|NATGAS/.test(s)) return 2;
  if (/XAG/.test(s)) return 3;
  return 5;
}

type Props = {
  instrument: string;
  timeframe: string;
  candles: MarketCandle[];
  height?: number;
};

const LiveChart = forwardRef<LiveChartHandle, Props>(function LiveChart(
  { instrument, timeframe, candles, height = 440 },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

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
    const el = containerRef.current;
    if (!el) return;

    const precision = precisionFor(instrument);
    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || height,
      layout: {
        background: { type: ColorType.Solid, color: "#070B10" },
        textColor: "#8FA3A6",
        fontFamily: "Chivo, ui-sans-serif, sans-serif",
        fontSize: 11,
      },
      localization: {
        timeFormatter: (time: number) =>
          `${new Date(time * 1000).toISOString().slice(11, 16)} UTC`,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(129,255,217,0.35)",
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0D141C",
        },
        horzLine: {
          color: "rgba(129,255,217,0.35)",
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0D141C",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.08, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: timeframe !== "D1",
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 9,
        shiftVisibleRangeOnNewBar: true,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#81FFD9",
      downColor: "#F355D0",
      borderVisible: false,
      wickUpColor: "#81FFD9",
      wickDownColor: "#F355D0",
      priceFormat: {
        type: "price",
        precision,
        minMove: 1 / 10 ** precision,
      },
    });


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
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
    };
  }, [height, instrument, timeframe]);

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
  }, [candles, instrument]);

  return <div ref={containerRef} className="h-full w-full" />;
});

export default LiveChart;
