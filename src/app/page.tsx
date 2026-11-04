import Image from "next/image";
import Link from "next/link";
import { HeroStage } from "@/components/HeroStage";
import { LogoLockup } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";

const steps = [
  {
    n: "01",
    model: "Live Market Feed",
    title: "Pick",
    tone: "violet",
    icon: "feed",
    text: "Choose the asset and the timeframe. The live feed builds the chart instantly, with no upload.",
  },
  {
    n: "02",
    model: "SAM 3.1",
    title: "Read",
    tone: "teal",
    icon: "scan",
    text: "One click. SAM segments the chart panel, then the engine measures the candles, swing levels and trend from the live data.",
  },
  {
    n: "03",
    model: "Muse Spark",
    title: "Reason",
    tone: "pink",
    icon: "spark",
    text: "Muse reads the chart and the measured structure, then writes the entry, stop, three targets and the reasoning.",
  },
] as const;

const stepTones = {
  teal: {
    line: "bg-teal",
    iconBox: "border-teal/25 bg-teal/10 text-teal",
    number: "text-teal",
    chip: "border-teal/30 bg-teal/10 text-teal shadow-[0_0_24px_-10px_rgba(129,255,217,0.7)]",
    dot: "bg-teal",
  },
  violet: {
    line: "bg-[#6E9AFF]",
    iconBox: "border-[#6E9AFF]/25 bg-[#6E9AFF]/10 text-[#6E9AFF]",
    number: "text-[#6E9AFF]",
    chip: "border-[#6E9AFF]/30 bg-[#6E9AFF]/10 text-[#6E9AFF] shadow-[0_0_24px_-10px_rgba(110,154,255,0.7)]",
    dot: "bg-[#6E9AFF]",
  },
  pink: {
    line: "bg-pink",
    iconBox: "border-pink/25 bg-pink/10 text-pink",
    number: "text-pink",
    chip: "border-pink/30 bg-pink/10 text-pink shadow-[0_0_24px_-10px_rgba(243,85,208,0.7)]",
    dot: "bg-pink",
  },
};

function StepIcon({ name }: { name: "feed" | "scan" | "spark" }) {
  if (name === "feed") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 12h4l3-7 4 14 3-7h2" />
      </svg>
    );
  }
  if (name === "scan") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 12h10" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

type OutputIconName = "compass" | "target" | "shield" | "flag" | "structure" | "advocate";

function OutputIcon({ name }: { name: OutputIconName }) {
  const shared = {
    viewBox: "0 0 24 24",
    className: "h-[17px] w-[17px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "compass") {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5z" />
      </svg>
    );
  }
  if (name === "target") {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg {...shared}>
        <path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6z" />
        <path d="M9.5 12l1.8 1.9 3.4-3.6" />
      </svg>
    );
  }
  if (name === "flag") {
    return (
      <svg {...shared}>
        <path d="M6 21V4" />
        <path d="M6 5h9.5l-1.2 3.5L15.5 12H6" />
        <path d="M18 4v4M20 6h-4" />
      </svg>
    );
  }
  if (name === "structure") {
    return (
      <svg {...shared}>
        <path d="M3 17l4.5-5 3.5 3 4-6 5 4" />
        <circle cx="7.5" cy="12" r="1.3" />
        <circle cx="11" cy="15" r="1.3" />
        <circle cx="15" cy="9" r="1.3" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 9v4.5" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

const outputs = [
  {
    title: "Directional bias",
    icon: "compass",
    tone: "violet",
    tip: "One call, long, short or a deliberate no-trade, with an honest confidence score and the reasoning behind it.",
  },
  {
    title: "Entry zone",
    icon: "target",
    tone: "teal",
    tip: "A price band the setup is valid in, sized to the timeframe, so a wide zone never hides a poor fill.",
  },
  {
    title: "Stop loss",
    icon: "shield",
    tone: "pink",
    tip: "Placed beyond the structure that would prove the idea wrong, never at an arbitrary distance.",
  },
  {
    title: "Three targets",
    icon: "flag",
    tone: "violet",
    tip: "Three ordered take profits, each with its own reason for existing, from continuation to mean reversion.",
  },
  {
    title: "Market structure",
    icon: "structure",
    tone: "teal",
    tip: "The last break of structure, any change of character, and the liquidity and price levels that actually matter.",
  },
  {
    title: "Devil's advocate",
    icon: "advocate",
    tone: "pink",
    tip: "The strongest case against the trade, the trigger that invalidates it, and why the setup still stands.",
  },
] as const;

const outputTones = {
  violet: {
    bar: "bg-[#6E9AFF]",
    icon: "border-[#6E9AFF]/25 bg-[#6E9AFF]/10 text-[#6E9AFF]",
    index: "text-[#6E9AFF]/60",
    dot: "bg-[#6E9AFF]",
  },
  teal: {
    bar: "bg-teal",
    icon: "border-teal/25 bg-teal/10 text-teal",
    index: "text-teal/60",
    dot: "bg-teal",
  },
  pink: {
    bar: "bg-pink",
    icon: "border-pink/25 bg-pink/10 text-pink",
    index: "text-pink/60",
    dot: "bg-pink",
  },
};

type PrincipleIconName = "measure" | "lock" | "eye" | "cursor";

const principles = [
  {
    title: "Measured",
    icon: "measure",
    text: "Highs, lows and levels come from the live OHLC feed, so the model reads real numbers instead of guessing coordinates from pixels.",
    iconBox: "border-[#6E9AFF]/25 bg-[#6E9AFF]/10 text-[#6E9AFF]",
    glow: "bg-[radial-gradient(circle,rgba(110,154,255,0.35),transparent_65%)]",
    glowDot: "bg-[#6E9AFF]",
  },
  {
    title: "Constrained",
    icon: "lock",
    text: "The plan is returned against a strict JSON schema. A missing field fails the scan instead of reaching the screen half written.",
    iconBox: "border-teal/25 bg-teal/10 text-teal",
    glow: "bg-[radial-gradient(circle,rgba(129,255,217,0.3),transparent_65%)]",
    glowDot: "bg-teal",
  },
  {
    title: "Honest",
    icon: "eye",
    text: "If a panel is missing or the price axis is unreadable, the scan says so. It does not invent a level to fill the gap.",
    iconBox: "border-pink/25 bg-pink/10 text-pink",
    glow: "bg-[radial-gradient(circle,rgba(243,85,208,0.3),transparent_65%)]",
    glowDot: "bg-pink",
  },
  {
    title: "On demand",
    icon: "cursor",
    text: "No background monitoring and no watchlist polling. Analysis runs when you press Analyse, on the chart in front of you.",
    iconBox: "border-[#6E9AFF]/25 bg-[#6E9AFF]/10 text-[#6E9AFF]",
    glow: "bg-[radial-gradient(circle,rgba(110,154,255,0.35),transparent_65%)]",
    glowDot: "bg-[#6E9AFF]",
  },
] as const;

const metaModels = [
  {
    name: "SAM 3.1",
    id: "sam-3.1",
    role: "Vision pass",
    status: "Live",
    tone: "teal",
    icon: "vision",
    text: "Segments the chart panel and the objects inside it, so the engine knows where the market sits before it reads a single price.",
  },
  {
    name: "Muse Spark 1.3",
    id: "muse-spark-1.3",
    role: "Reasoning pass",
    status: "Live",
    tone: "violet",
    icon: "reason",
    text: "Reads the chart alongside the measured structure, then writes the entry, the stop, three targets and the case against the trade.",
  },
  {
    name: "Muse Image 1.0",
    id: "muse-image-1.0",
    role: "Visual pass",
    status: "In build",
    tone: "pink",
    icon: "image",
    text: "Renders the annotated chart and the report graphics, so a plan can be reviewed at a glance instead of read line by line.",
  },
] as const;

const modelTones = {
  teal: {
    iconBox: "border-teal/25 bg-teal/10 text-teal",
    status: "border-teal/30 bg-teal/[0.08] text-teal",
    id: "text-teal/70",
    role: "text-teal",
    glow: "bg-[radial-gradient(circle,rgba(129,255,217,0.3),transparent_65%)]",
  },
  violet: {
    iconBox: "border-[#6E9AFF]/25 bg-[#6E9AFF]/10 text-[#6E9AFF]",
    status: "border-[#6E9AFF]/30 bg-[#6E9AFF]/[0.08] text-[#6E9AFF]",
    id: "text-[#6E9AFF]/70",
    role: "text-[#6E9AFF]",
    glow: "bg-[radial-gradient(circle,rgba(110,154,255,0.35),transparent_65%)]",
  },
  pink: {
    iconBox: "border-pink/25 bg-pink/10 text-pink",
    status: "border-pink/30 bg-pink/[0.08] text-pink",
    id: "text-pink/70",
    role: "text-pink",
    glow: "bg-[radial-gradient(circle,rgba(243,85,208,0.3),transparent_65%)]",
  },
};

function PrincipleIcon({ name }: { name: PrincipleIconName }) {
  const shared = {
    viewBox: "0 0 24 24",
    className: "h-[15px] w-[15px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "measure") {
    return (
      <svg {...shared}>
        <path d="M3 12h18" />
        <path d="M6 9v6M10 10v4M14 9v6M18 10v4" />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg {...shared}>
        <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
        <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
        <path d="M12 14v2.5" />
      </svg>
    );
  }
  if (name === "eye") {
    return (
      <svg {...shared}>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <path d="m5 3.5 13 7.2-5.6 1.6-1.9 5.4z" />
      <path d="M13.5 14.5 19 20" />
    </svg>
  );
}

function ModelIcon({ name }: { name: "vision" | "reason" | "image" }) {
  const shared = {
    viewBox: "0 0 24 24",
    className: "h-[18px] w-[18px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "vision") {
    return (
      <svg {...shared}>
        <path d="M3 8V5.5A1.5 1.5 0 0 1 4.5 4H7" />
        <path d="M17 4h2.5A1.5 1.5 0 0 1 21 5.5V8" />
        <path d="M21 16v2.5a1.5 1.5 0 0 1-1.5 1.5H17" />
        <path d="M7 20H4.5A1.5 1.5 0 0 1 3 18.5V16" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }
  if (name === "reason") {
    return (
      <svg {...shared}>
        <path d="M12 4.5a4 4 0 0 0-4 4v.6A4 4 0 0 0 6 12.7V14a4 4 0 0 0 4 4h.5V20" />
        <path d="M12 4.5a4 4 0 0 1 4 4v.6a4 4 0 0 1 2 3.6V14a4 4 0 0 1-4 4h-.5V20" />
        <path d="M12 4.5V20" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4.5 17 5-5 3.5 3.5 3-2.5 3.5 4" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-canvas">
      <div className="aurora" aria-hidden>
        <div className="aurora-blob aurora-blob-a" />
        <div className="aurora-blob aurora-blob-b" />
        <div className="aurora-blob aurora-blob-c" />
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="ChartCortex home">
            <LogoLockup size={40} />
          </Link>
          <nav className="hidden items-center gap-7 font-chivo text-[13px] font-semibold uppercase tracking-[0.02em] text-muted md:flex">
            <a href="#how" className="transition-colors hover:text-ink">How it works</a>
            <a href="#meta" className="transition-colors hover:text-ink">Meta models</a>
            <a
              href="https://github.com/shyampitamber/ChartCortex"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-ink"
            >
              GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/scan" className="btn btn-teal btn-sm">
              Open the app
            </Link>
          </div>
        </div>
        <div className="brand-rule" aria-hidden />
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-6xl px-5 pb-4 pt-4 text-center sm:pt-6">
            <div className="relative inline-flex">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[92px] w-[250px] -translate-x-1/2 -translate-y-1/2">
                <svg viewBox="0 0 250 92" className="h-full w-full">
                  <defs>
                    <linearGradient id="pillRingTeal" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#81FFD9" stopOpacity="0" />
                      <stop offset="50%" stopColor="#81FFD9" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#81FFD9" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="pillRingPink" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F355D0" stopOpacity="0" />
                      <stop offset="50%" stopColor="#F355D0" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#F355D0" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="pillRingViolet" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6E9AFF" stopOpacity="0" />
                      <stop offset="50%" stopColor="#6E9AFF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#6E9AFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g className="pill-orbit-wrap">
                    <ellipse
                      cx="125"
                      cy="46"
                      rx="98"
                      ry="20"
                      transform="rotate(-8 125 46)"
                      className="pill-orbit pill-orbit-a"
                    />
                    <ellipse
                      cx="125"
                      cy="46"
                      rx="110"
                      ry="25"
                      transform="rotate(6 125 46)"
                      className="pill-orbit pill-orbit-b"
                    />
                    <ellipse
                      cx="125"
                      cy="46"
                      rx="84"
                      ry="15"
                      transform="rotate(-2 125 46)"
                      className="pill-orbit pill-orbit-c"
                    />
                  </g>
                </svg>
              </div>
              <span className="glass-pill relative z-10 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
                Live Market AI
              </span>
            </div>

            <div className="mt-10 grid items-center justify-items-center gap-3 md:grid-cols-[1fr_44px_auto_44px_1fr] md:gap-4">
              <h1 className="text-gradient-violet font-chivo text-[28px] font-black leading-[1.06] tracking-[-0.02em] sm:text-[34px] md:justify-self-end md:text-right lg:text-[40px]">
                Select your Chart
              </h1>

              <div className="arrow-right hidden text-accent md:flex" aria-hidden>
                <svg viewBox="0 0 40 18" className="h-4 w-10 overflow-visible">
                  <path
                    d="M2 9h30"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    className="arrow-dash"
                  />
                  <path
                    d="m27 4 5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="relative">
                <Link
                  href="/scan"
                  className="scan-btn btn btn-teal relative z-10 min-w-[190px] px-10"
                >
                  Analyse
                </Link>
              </div>

              <div className="arrow-right hidden text-pink md:flex" aria-hidden>
                <svg viewBox="0 0 40 18" className="h-4 w-10 overflow-visible">
                  <path
                    d="M2 9h30"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    className="arrow-dash"
                  />
                  <path
                    d="m27 4 5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="text-gradient-pink font-chivo text-[28px] font-black leading-[1.06] tracking-[-0.02em] sm:text-[34px] md:justify-self-start md:text-left lg:text-[40px]">
                Get a Trade Plan
              </h2>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[1320px] px-2 pb-10">
            <HeroStage />
          </div>
        </section>

        <section className="glass-section relative z-10 border-y border-white/10">
          <div className="relative overflow-hidden px-5 py-14 sm:py-16">
            <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(129,255,217,0.18),transparent_65%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,85,208,0.16),transparent_65%)] blur-3xl" />
            <div className="relative mx-auto max-w-5xl text-center">
              <p className="font-chivo text-[24px] font-bold leading-snug tracking-[-0.01em] text-ink sm:text-[30px]">
                Select an asset and timeframe. The live chart is analysed and
                returns the entry, stop, three targets and the reasoning, in under
                a minute.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] font-semibold text-ink/80 sm:text-[15px]">
                {["Decision support only", "No execution", "No client funds"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-teal"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                Three clicks. One plan.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Pick an asset, pick a timeframe, press analyse. Every level is
                measured from the live market feed and the chart on screen.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const tone = stepTones[step.tone];
                return (
                  <div
                    key={step.n}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F14] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div className={`absolute inset-x-0 top-0 h-[2px] ${tone.line}`} />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${tone.iconBox}`}
                        >
                          <StepIcon name={step.icon} />
                        </span>
                        <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                          {step.title}
                        </h3>
                      </div>
                      <span
                        className={`font-chivo text-[36px] font-black leading-none ${tone.number}`}
                      >
                        {step.n}
                      </span>
                    </div>
                    <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted">
                      {step.text}
                    </p>
                    <div className="mt-5 flex items-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-chivo text-[12px] font-bold uppercase tracking-[0.14em] ${tone.chip}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${tone.dot} shadow-[0_0_10px_2px_currentColor]`}
                        />
                        {step.model}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="output" className="blueprint-band relative border-b border-line">
          <div className="blueprint-grid" aria-hidden />
          <div
            className="pointer-events-none absolute right-[-8%] top-1/2 h-[520px] w-[620px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(85,47,246,0.22),transparent_65%)] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[-10%] left-[4%] h-[320px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(129,255,217,0.12),transparent_65%)] blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[0.82fr_1.18fr] md:gap-14">
            <div className="md:sticky md:top-24 md:self-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-chivo text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                The output
              </span>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                One scan. A full desk note.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                No thread to assemble and nothing left to interpret. Every scan
                returns one structured plan, and every line below is something the
                engine commits to in writing.
              </p>
              <p className="mt-6 flex items-center gap-2 font-chivo text-[10px] font-bold uppercase tracking-[0.18em] text-muted/70">
                <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                Hover a line for the detail
              </p>
            </div>

            <ul className="border-y border-[var(--bp-line)]">
              {outputs.map((item, i) => {
                const tone = outputTones[item.tone];
                return (
                  <li
                    key={item.title}
                    tabIndex={0}
                    className="group relative border-b border-[var(--bp-line)] outline-none last:border-b-0"
                  >
                    <div className="rail-row relative flex items-center gap-4 py-5 pl-4 pr-1">
                      <span
                        className={`absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 rounded-full ${tone.bar} transition-all duration-300 group-hover:h-[72%] group-focus-within:h-[72%]`}
                      />
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-transform duration-300 group-hover:scale-105 ${tone.icon}`}
                      >
                        <OutputIcon name={item.icon} />
                      </span>
                      <h3 className="flex-1 font-chivo text-[18px] font-bold uppercase leading-none tracking-[0.01em] text-ink/80 transition-colors duration-300 group-hover:text-ink group-focus-within:text-ink sm:text-[20px]">
                        {item.title}
                      </h3>
                      <span
                        className={`hidden font-mono text-[10px] tracking-[0.1em] sm:block ${tone.index}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 text-[13px] leading-none text-muted transition-all duration-300 group-hover:rotate-45 group-hover:border-white/30 group-hover:text-ink group-focus-within:rotate-45">
                        +
                      </span>
                    </div>

                    <p className="px-4 pb-4 text-[12.5px] leading-relaxed text-muted md:hidden">
                      {item.tip}
                    </p>

                    <div
                      role="tooltip"
                      className="pointer-events-none absolute right-0 top-full z-20 hidden w-[380px] translate-y-1 overflow-hidden rounded-xl border border-white/[0.12] bg-[#141C23]/92 opacity-0 shadow-[0_30px_70px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block"
                    >
                      <div className="bg-gradient-to-b from-white/[0.07] to-transparent p-4">
                        <div className="flex items-center gap-2 font-chivo text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#8fa3a6]">
                          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                          Detail
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-[#eaf2f0]/90">
                          {item.tip}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pb-16">
            <div className="mb-4 flex items-end justify-between gap-4">
              <p className="font-chivo text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                The plan, as it renders
              </p>
              <p className="hidden text-[11px] text-muted/70 sm:block">
                Live terminal, XAUUSD, H1
              </p>
            </div>
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_50%_35%,rgba(85,47,246,0.24),transparent_66%)] blur-2xl"
                aria-hidden
              />
              <div className="glass-card relative overflow-hidden p-2">
                <Image
                  src="/screenshot.png"
                  alt="ChartCortex terminal showing a live XAUUSD chart and the trade plan it returns"
                  width={1440}
                  height={900}
                  sizes="(min-width: 1152px) 1104px, 100vw"
                  className="h-auto w-full rounded-[14px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="meta" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-chivo text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  How it runs
                </span>
                <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                  Built on the Meta Model API.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Every scan is a live call to api.meta.ai. Meta vision locates the
                  chart panel, Meta reasoning reads it against measured market data,
                  and the plan returns as a validated object. There is no other model
                  provider in the path.
                </p>
                <div className="mt-6 inline-flex items-center gap-2.5 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                  POST api.meta.ai/v1/responses
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {principles.map((item) => (
                  <div
                    key={item.title}
                    className="group glass-panel relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <span
                      className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${item.glow}`}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-lg border transition-transform duration-300 group-hover:scale-105 ${item.iconBox}`}
                        >
                          <PrincipleIcon name={item.icon} />
                        </span>
                        <span className="font-chivo text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink/70 transition-colors group-hover:text-ink">
                          {item.title}
                        </span>
                      </div>
                      <span className={`h-1 w-1 rounded-full ${item.glowDot}`} />
                    </div>
                    <p className="relative mt-3 text-[13px] leading-relaxed text-muted">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {metaModels.map((model) => {
                const tone = modelTones[model.tone];
                return (
                  <article
                    key={model.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <span
                      className={`pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${tone.glow}`}
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${tone.iconBox}`}
                      >
                        <ModelIcon name={model.icon} />
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 font-chivo text-[9px] font-bold uppercase tracking-[0.16em] ${tone.status}`}
                      >
                        {model.status}
                      </span>
                    </div>
                    <h3 className="relative mt-4 font-chivo text-[17px] font-bold uppercase tracking-[0.02em] text-ink">
                      {model.name}
                    </h3>
                    <div className={`relative mt-1 font-mono text-[11px] ${tone.id}`}>
                      {model.id}
                    </div>
                    <p className="relative mt-3 flex-1 text-[12.5px] leading-relaxed text-muted">
                      {model.text}
                    </p>
                    <div
                      className={`relative mt-4 border-t border-white/10 pt-3 font-chivo text-[9.5px] font-bold uppercase tracking-[0.18em] ${tone.role}`}
                    >
                      {model.role}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cta-band relative overflow-hidden border-y border-white/10">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(85,47,246,0.30),transparent_44%,rgba(243,85,208,0.22))]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-full h-[520px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(129,255,217,0.18),transparent_65%)] blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-chivo text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Open the terminal
            </span>
            <h2 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]">
              Pick a chart. Read the plan.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Choose an asset and a timeframe, press Analyse, and the terminal
              returns the entry, the stop, three targets and the reasoning in under
              a minute.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/scan"
                className="scan-btn btn btn-teal relative z-10 min-w-[190px] px-10"
              >
                Analyse
              </Link>
            </div>
            <p className="mt-6 font-chivo text-[10px] font-bold uppercase tracking-[0.18em] text-muted/70">
              Free to try. Decision support only.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
