/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HeroStage } from "@/components/HeroStage";
import { LogoLockup } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";

const steps = [
  {
    n: "01",
    model: "OANDA feed",
    title: "Load",
    text: "The asset and timeframe you pick stream into a live candlestick chart from the market data feed.",
  },
  {
    n: "02",
    model: "SAM 3.1",
    title: "Read",
    text: "SAM 3.1 segments the live chart panel and its visible objects on every scan.",
  },
  {
    n: "03",
    model: "Muse Spark",
    title: "Reason",
    text: "Muse Spark reads the chart with the measured OHLC structure and returns one schema-constrained plan.",
  },
];

const outputs = [
  ["Bias and conviction", "One directional call, or a deliberate no-trade, with an honest confidence score."],
  ["Entry zone", "A tradeable range that respects the timeframe width rules."],
  ["Stop loss", "Placed against the structure that would prove the idea wrong."],
  ["Three targets", "Ordered take profits with a rationale for each."],
  ["Market structure", "Last break of structure, change of character, liquidity and key levels."],
  ["Devil's advocate", "The strongest counter case, the invalidation trigger, and why the setup still holds."],
];

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

          <div className="relative mx-auto w-full max-w-[1320px] px-2 pb-8">
            <HeroStage />
            <div className="mt-8 text-center">
              <p className="mx-auto max-w-xl text-[14.5px] leading-relaxed text-muted">
                Select an asset and timeframe. The live chart is analysed and
                returns the entry, stop, three targets and the reasoning, in under
                a minute.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted">
                {["Decision support only", "No execution", "No client funds"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-accent"
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
                Three passes, one plan.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Every level is measured from the live OANDA feed and the chart on
                screen.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="glass-panel p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-accent">{step.n}</span>
                    <span className="rounded border border-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                      {step.model}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="output" className="border-b border-line">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                Everything a decision needs.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                The same structure an institutional desk would write down, returned as
                one object instead of six messages.
              </p>
              <dl className="mt-6 space-y-3">
                {outputs.map(([title, text]) => (
                  <div key={title} className="flex gap-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pink" />
                    <div>
                      <dt className="text-[13px] font-medium text-ink">{title}</dt>
                      <dd className="text-[12.5px] leading-relaxed text-muted">{text}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_50%_40%,rgba(16,91,255,0.22),transparent_65%)] blur-2xl" />
              <div className="glass-card relative p-2">
                <img
                  src="/screenshot.png"
                  alt="ChartCortex workbench showing a live chart and a trade plan"
                  className="relative w-full rounded-[16px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="meta" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                  Built on the Meta Model API.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Every scan is a real request to api.meta.ai. The app shows the Meta
                  response IDs for the segmentation and the reasoning on every result,
                  so the calls are never a claim, they are a receipt. The mark was
                  supplied as a 3D render and refined into the app icon and lockups.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["sam-3.1", "muse-spark-1.3", "muse-image-1.0"].map((model) => (
                    <span
                      key={model}
                      className="rounded-md border border-accent/40 bg-teal/10 px-2.5 py-1 font-mono text-[10.5px] text-accent"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-panel p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Measured
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    Candle highs, lows and clustered levels come from the live OHLC
                    data, not from a language model guessing coordinates.
                  </p>
                </div>
                <div className="glass-panel p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Constrained
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    The plan is enforced by a JSON schema, so the interface always
                    receives a complete, valid object.
                  </p>
                </div>
                <div className="glass-panel p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Honest
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    Missing panels score zero. If the price axis is unreadable, the plan
                    says so instead of inventing prices.
                  </p>
                </div>
                <div className="glass-panel p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    On demand
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    No background monitoring. Each analysis runs when you ask for it,
                    on the chart in front of you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-5 py-20 text-center">
            <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]">
              Put a chart in. Get the structure out.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
              No account needed. Pick an asset, pick a timeframe, and press Analyse.
            </p>
            <Link
              href="/scan"
              className="mt-7 inline-block rounded-md bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9CFFE5]"
            >
              Analyse a chart
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
