import { createElement } from "react";

type Feed = {
  label: string;
  symbol: string;
  top: string;
  left: string;
  delay: string;
  path: string;
};

const FEEDS: Feed[] = [
  {
    label: "Forex",
    symbol: "EUR/USD",
    top: "14%",
    left: "1.5%",
    delay: "0s",
    path: "M175 105 C300 105 390 180 480 232",
  },
  {
    label: "Indices",
    symbol: "NAS100",
    top: "36%",
    left: "0.5%",
    delay: "0.8s",
    path: "M175 228 C300 228 390 250 480 262",
  },
  {
    label: "Metals",
    symbol: "XAU/USD",
    top: "58%",
    left: "2%",
    delay: "1.6s",
    path: "M175 352 C300 352 390 320 480 298",
  },
  {
    label: "Crypto",
    symbol: "BTC/USD",
    top: "80%",
    left: "1%",
    delay: "2.4s",
    path: "M175 475 C300 475 400 370 480 330",
  },
];

const REPORT = {
  instrument: "XAUUSD",
  timeframe: "H1",
  bias: "Bullish",
  confidence: 78,
  entry: "4,340.0",
  stop: "4,330.0",
  tp1: "4,369.0",
  tp2: "4,381.0",
  structure: "BOS up at 4,238.50",
};

function MiniReport({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`hero-report ${compact ? "hero-report-compact" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-chivo text-[9.5px] uppercase tracking-[0.16em] text-muted">
          AI report
        </span>
        <span className="rounded border border-up/30 bg-up/10 px-1.5 py-0.5 font-chivo text-[9px] font-semibold uppercase tracking-[0.08em] text-up">
          {REPORT.bias}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <span className="font-chivo text-[13px] font-semibold uppercase tracking-[0.04em]">
          {REPORT.instrument} <span className="text-muted">/ {REPORT.timeframe}</span>
        </span>
        <span className="font-mono text-[20px] leading-none">{REPORT.confidence}</span>
      </div>
      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-pink"
          style={{ width: `${REPORT.confidence}%` }}
        />
      </div>
      <div className="mt-3 space-y-1 font-mono text-[10.5px] text-muted">
        <div className="flex justify-between">
          <span>Entry</span>
          <span className="text-ink">{REPORT.entry}</span>
        </div>
        <div className="flex justify-between">
          <span>Stop</span>
          <span className="text-ink">{REPORT.stop}</span>
        </div>
        <div className="flex justify-between">
          <span>TP1</span>
          <span className="text-ink">{REPORT.tp1}</span>
        </div>
        <div className="flex justify-between">
          <span>TP2</span>
          <span className="text-ink">{REPORT.tp2}</span>
        </div>
      </div>
      <div className="mt-2.5 border-t border-line pt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
        {REPORT.structure}
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
        <span>Meta models</span>
        <span>12.4s</span>
      </div>
    </div>
  );
}

function Chip({ feed, compact = false }: { feed: Feed; compact?: boolean }) {
  return (
    <div
      className={`hero-chip ${compact ? "hero-chip-compact" : "hero-float"}`}
      style={
        compact
          ? undefined
          : { top: feed.top, left: feed.left, animationDelay: feed.delay }
      }
    >
      <span className="hero-chip-dot" />
      <span className="flex min-w-0 flex-col">
        <span className="font-chivo text-[8.5px] font-semibold uppercase tracking-[0.16em] text-muted">
          {feed.label}
        </span>
        <span className="font-mono text-[10.5px] text-ink">{feed.symbol}</span>
      </span>
    </div>
  );
}

export function HeroStage() {
  return (
    <div className="relative w-full">
      {/* desktop stage */}
      <div className="relative mx-auto hidden aspect-[1200/560] w-full max-w-[1240px] lg:block">
        <svg
          viewBox="0 0 1200 560"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="feedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#81FFD9" stopOpacity="0.15" />
              <stop offset="65%" stopColor="#81FFD9" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#105BFF" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="outGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#105BFF" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#F355D0" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F355D0" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="ringTeal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#81FFD9" stopOpacity="0" />
              <stop offset="50%" stopColor="#81FFD9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#81FFD9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ringPink" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F355D0" stopOpacity="0" />
              <stop offset="50%" stopColor="#F355D0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F355D0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ringViolet" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#105BFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#105BFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#105BFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#105BFF" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#F355D0" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#105BFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="600" cy="280" r="300" fill="url(#coreGlow)" />

          <g className="orbit-wrap">
            <ellipse
              cx="600"
              cy="280"
              rx="250"
              ry="86"
              transform="rotate(-16 600 280)"
              className="orbit orbit-a"
            />
            <ellipse
              cx="600"
              cy="280"
              rx="305"
              ry="104"
              transform="rotate(12 600 280)"
              className="orbit orbit-b"
            />
            <ellipse
              cx="600"
              cy="280"
              rx="196"
              ry="64"
              transform="rotate(-4 600 280)"
              className="orbit orbit-c"
            />
          </g>

          {FEEDS.map((feed, index) => (
            <path
              key={feed.label}
              id={`feed-path-${index}`}
              d={feed.path}
              fill="none"
              stroke="url(#feedGrad)"
              strokeWidth="1.4"
              className="flow"
            />
          ))}

          <path
            d="M720 280 C790 280 820 290 870 290"
            fill="none"
            stroke="url(#outGrad)"
            strokeWidth="1.8"
            className="flow flow-out"
          />

          {FEEDS.map((feed, index) => (
            <circle key={`dot-${feed.label}`} r="2.6" fill="#81FFD9">
              {createElement("animateMotion", {
                dur: `${3.4 + index * 0.5}s`,
                begin: `${index * 0.55}s`,
                repeatCount: "indefinite",
                path: feed.path,
              })}
            </circle>
          ))}
          <circle r="3.2" fill="#F355D0">
            {createElement("animateMotion", {
              dur: "3.6s",
              repeatCount: "indefinite",
              path: "M720 280 C790 280 820 290 870 290",
            })}
          </circle>
        </svg>

        <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,91,255,0.28),rgba(243,85,208,0.12)_55%,transparent_70%)] blur-2xl" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/mark-t-512.png"
          alt="ChartCortex brain and candle mark"
          className="absolute left-1/2 top-1/2 h-[236px] w-[236px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_20px_60px_rgba(16,91,255,0.35)]"
        />

        {FEEDS.map((feed) => (
          <Chip key={feed.label} feed={feed} />
        ))}

        <MiniReport />
      </div>

      {/* mobile / tablet stage */}
      <div className="lg:hidden">
        <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
          {FEEDS.map((feed) => (
            <Chip key={feed.label} feed={feed} compact />
          ))}
        </div>
        <div className="relative mx-auto mt-6 grid h-52 w-52 place-items-center">
          <div className="hero-mobile-ring hero-mobile-ring-a" />
          <div className="hero-mobile-ring hero-mobile-ring-b" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mark-t-512.png"
            alt="ChartCortex brain and candle mark"
            className="h-36 w-36 drop-shadow-[0_20px_50px_rgba(16,91,255,0.35)]"
          />
        </div>
        <div className="mx-auto mt-6 max-w-[340px]">
          <MiniReport compact />
        </div>
      </div>
    </div>
  );
}
