import { createElement } from "react";
import { ReportView, type ReportData } from "@/components/ReportView";

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
  duration: string;
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
    top: "4.5%",
    left: "13%",
    delay: "0s",
    duration: "9s",
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
    top: "28%",
    left: "12%",
    delay: "0.7s",
    duration: "12s",
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
    top: "51.5%",
    left: "13%",
    delay: "1.4s",
    duration: "10.5s",
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
    label: "Energies",
    symbol: "WTI/USD",
    price: "78.42",
    change: "+0.35%",
    up: true,
    top: "75%",
    left: "12%",
    delay: "2.1s",
    duration: "14s",
    path: "M280 480 C350 480 410 372 480 322",
    candles: [
      { h: 52, up: true },
      { h: 66, up: false },
      { h: 48, up: true },
      { h: 72, up: true },
      { h: 58, up: false },
      { h: 64, up: true },
      { h: 50, up: false },
      { h: 76, up: true },
      { h: 60, up: true },
    ],
  },
];

const HERO_REPORT: ReportData = {
  instrument: "XAUUSD",
  timeframe: "H1",
  bias: "Bullish",
  confidence: 78,
  riskLevel: "Medium",
  entryLow: 4340,
  entryHigh: 4346,
  stop: 4330,
  targets: [
    { label: "TP1", price: 4369, note: "prior high" },
    { label: "TP2", price: 4381, note: "range high" },
    { label: "TP3", price: 4394, note: "round number" },
  ],
  summary:
    "Gold is holding a sequence of higher lows above the daily pivot. The last break of structure was to the upside and price is retesting the breakout shelf. Continuation is preferred while 4,330 holds.",
  driver: "Dollar softness",
  trend: "Uptrend",
  support: 4322.4,
  resistance: 4370,
  invalidation:
    "An hourly close below 4,330 breaks the higher low sequence and invalidates the setup.",
  metaTime: "12.4s",
};

const heroFormat = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

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
          : { top: feed.top, left: feed.left, animationDelay: feed.delay, animationDuration: feed.duration }
      }
    >
      <div className="font-chivo text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
        {feed.label}
      </div>
      <div className="hero-mini-chart">
        <div className="hero-candle-track">
          {[...feed.candles, ...feed.candles].map((candle, index) => (
            <span
              key={`${feed.label}-${index}`}
              className={`hero-candle ${candle.up ? "hero-candle-up" : "hero-candle-down"}`}
              style={{
                height: `${candle.h}%`,
                animationDelay: `${(index % feed.candles.length) * 0.14}s`,
              }}
            />
          ))}
        </div>
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

export function HeroStage() {
  return (
    <div className="relative w-full">
      <div className="relative mx-auto hidden aspect-[1200/560] w-full max-w-[1240px] lg:block" style={{ perspective: "1200px" }}>
        <div className="pointer-events-none absolute left-[4%] top-[16%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(16,91,255,0.35),transparent_65%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[2%] top-[24%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(243,85,208,0.28),transparent_65%)] blur-3xl" />
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

        <div className="hero-report"><ReportView data={HERO_REPORT} format={heroFormat} idSuffix="desk" /></div>
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
          <div className="glass-card mx-auto mt-6 max-w-[360px] p-4"><ReportView data={HERO_REPORT} format={heroFormat} idSuffix="mob" /></div>
        </div>
      </div>
    </div>
  );
}
