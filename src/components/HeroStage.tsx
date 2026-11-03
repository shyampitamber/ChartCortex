import { createElement } from "react";

type Candle = { h: number; up: boolean };

type Feed = {
  label: string;
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  top: string;
  left: string;
  delay: string;
  path: string;
  candles: Candle[];
};

const FEEDS: Feed[] = [
  {
    label: "Forex",
    symbol: "EUR/USD",
    price: "1.0842",
    change: "+0.24%",
    up: true,
    top: "8%",
    left: "13%",
    delay: "0s",
    path: "M280 108 C350 108 410 180 480 238",
    candles: [
      { h: 42, up: true },
      { h: 58, up: true },
      { h: 36, up: false },
      { h: 66, up: true },
      { h: 52, up: false },
      { h: 78, up: true },
      { h: 60, up: true },
      { h: 44, up: false },
      { h: 70, up: true },
    ],
  },
  {
    label: "Indices",
    symbol: "NAS100",
    price: "20,412",
    change: "+0.61%",
    up: true,
    top: "30%",
    left: "12%",
    delay: "0.7s",
    path: "M280 232 C350 232 410 252 480 264",
    candles: [
      { h: 52, up: true },
      { h: 44, up: false },
      { h: 68, up: true },
      { h: 60, up: true },
      { h: 40, up: false },
      { h: 72, up: true },
      { h: 56, up: false },
      { h: 80, up: true },
      { h: 64, up: true },
    ],
  },
  {
    label: "Metals",
    symbol: "XAU/USD",
    price: "4,340.0",
    change: "+0.48%",
    up: true,
    top: "52%",
    left: "13%",
    delay: "1.4s",
    path: "M280 356 C350 356 410 322 480 296",
    candles: [
      { h: 60, up: true },
      { h: 48, up: false },
      { h: 70, up: true },
      { h: 54, up: false },
      { h: 66, up: true },
      { h: 76, up: true },
      { h: 58, up: false },
      { h: 82, up: true },
      { h: 68, up: true },
    ],
  },
  {
    label: "Crypto",
    symbol: "BTC/USD",
    price: "96,840",
    change: "-0.18%",
    up: false,
    top: "74%",
    left: "12%",
    delay: "2.1s",
    path: "M280 480 C350 480 410 372 480 322",
    candles: [
      { h: 66, up: false },
      { h: 52, up: true },
      { h: 74, up: false },
      { h: 58, up: false },
      { h: 46, up: true },
      { h: 62, up: false },
      { h: 50, up: true },
      { h: 40, up: false },
      { h: 56, up: true },
    ],
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
  tp3: "4,394.0",
  rr: "2.1",
};

function FeedCard({
  feed,
  compact = false,
}: {
  feed: Feed;
  compact?: boolean;
}) {
  return (
    <div
      className={`hero-feed ${compact ? "hero-feed-compact" : "hero-float"}`}
      style={
        compact
          ? undefined
          : { top: feed.top, left: feed.left, animationDelay: feed.delay }
      }
    >
      <div className="flex items-center justify-between">
        <span className="font-chivo text-[8px] font-semibold uppercase tracking-[0.16em] text-muted">
          {feed.label}
        </span>
        <span className="font-mono text-[8px] text-muted">{feed.symbol}</span>
      </div>
      <div className="hero-mini-chart">
        {feed.candles.map((candle, index) => (
          <span
            key={`${feed.symbol}-${index}`}
            className={`hero-candle ${candle.up ? "hero-candle-up" : "hero-candle-down"}`}
            style={{ height: `${candle.h}%`, animationDelay: `${index * 0.14}s` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink">{feed.price}</span>
        <span
          className={`font-mono text-[9px] ${feed.up ? "text-up" : "text-down"}`}
        >
          {feed.change}
        </span>
      </div>
    </div>
  );
}

function MiniReport({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`hero-report ${compact ? "hero-report-compact" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-chivo text-[10px] uppercase tracking-[0.18em] text-muted">
          AI report
        </span>
        <span className="rounded border border-up/30 bg-up/10 px-2 py-0.5 font-chivo text-[10px] font-semibold uppercase tracking-[0.08em] text-up">
          {REPORT.bias}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="font-chivo text-[18px] font-bold uppercase tracking-[0.02em]">
            {REPORT.instrument}
          </div>
          <div className="font-mono text-[10px] text-muted">{REPORT.timeframe}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[30px] leading-none">{REPORT.confidence}</div>
          <div className="font-chivo text-[9px] uppercase tracking-[0.14em] text-muted">
            confidence
          </div>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-pink"
          style={{ width: `${REPORT.confidence}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["Entry", REPORT.entry],
          ["Stop", REPORT.stop],
          ["TP1", REPORT.tp1],
          ["TP2", REPORT.tp2],
          ["TP3", REPORT.tp3],
          ["R:R", REPORT.rr],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-line bg-canvas/60 px-2.5 py-2"
          >
            <div className="font-chivo text-[8.5px] uppercase tracking-[0.14em] text-muted">
              {label}
            </div>
            <div className="font-mono text-[13px] text-ink">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
        One plan. One confidence. No noise.
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        <span>Meta models</span>
        <span>12.4s</span>
      </div>
    </div>
  );
}

export function HeroStage() {
  return (
    <div className="relative w-full">
      <div className="relative mx-auto hidden aspect-[1200/560] w-full max-w-[1240px] lg:block">
        <svg viewBox="0 0 1200 560" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="feedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#81FFD9" stopOpacity="0.12" />
              <stop offset="65%" stopColor="#81FFD9" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#105BFF" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="outGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#105BFF" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#F355D0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F355D0" stopOpacity="0.15" />
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
            <ellipse cx="600" cy="280" rx="250" ry="86" transform="rotate(-16 600 280)" className="orbit orbit-a" />
            <ellipse cx="600" cy="280" rx="305" ry="104" transform="rotate(12 600 280)" className="orbit orbit-b" />
            <ellipse cx="600" cy="280" rx="196" ry="64" transform="rotate(-4 600 280)" className="orbit orbit-c" />
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
            d="M720 280 C760 280 780 285 800 288"
            fill="none"
            stroke="url(#outGrad)"
            strokeWidth="2"
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
              path: "M720 280 C760 280 780 285 800 288",
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
          <FeedCard key={feed.label} feed={feed} />
        ))}

        <MiniReport />
      </div>

      <div className="lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 justify-items-center gap-3">
          {FEEDS.map((feed) => (
            <FeedCard key={feed.label} feed={feed} compact />
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
        <div className="mx-auto mt-6 max-w-[360px]">
          <MiniReport compact />
        </div>
      </div>
    </div>
  );
}
