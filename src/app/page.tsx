/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const steps = [
  {
    n: "01",
    model: "SAM 3.1",
    title: "Segment",
    text: "The chart panel and its visible objects are segmented from the image, in the same request that reads the screenshot.",
  },
  {
    n: "02",
    model: "Geometry layer",
    title: "Measure",
    text: "Every candle is recovered from the pixels, then swing highs, swing lows, support, resistance and the trend are calculated. Measured, not guessed.",
  },
  {
    n: "03",
    model: "Muse Spark",
    title: "Reason",
    text: "The model reads the image together with the measured geometry and returns one schema-constrained plan with a written rationale.",
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
    <div className="min-h-screen bg-canvas">
      <header className="glass-bar sticky top-0 z-30 border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="ChartCortex home">
            <LogoLockup size={32} />
          </Link>
          <nav className="hidden items-center gap-7 font-poppins text-[13.5px] font-medium text-muted md:flex">
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
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="hero-aurora">
            <div className="hero-blob hero-blob-a" />
            <div className="hero-blob hero-blob-b" />
          </div>

          <div className="relative mx-auto max-w-4xl px-5 pb-10 pt-20 text-center sm:pt-24">
            <span className="glass-pill text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Chart image intelligence
            </span>

            <h1 className="mt-7 text-[42px] font-[650] leading-[1.02] tracking-[-0.03em] sm:text-[64px]">
              Your chart is the input.
              <br />
              <span className="text-ink">A trade plan is the </span>
              <span className="text-pink">output.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted">
              Upload a screenshot and get the entry, stop, three targets and the
              reasoning, in under a minute.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/scan" className="btn btn-teal">
                Analyse a chart
              </Link>
              <a href="#how" className="btn btn-glass">
                See how it works
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
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

          <div className="relative mx-auto w-[min(1120px,94vw)] pb-14">
            <div className="hero-stage">
              <video
                src="/media/demo.mp4"
                poster="/media/demo-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                aria-label="ChartCortex analysing an uploaded chart and returning a trade plan"
              />
            </div>
            <p className="mt-3 text-center text-[11px] text-muted">
              A real scan, recorded from the app. No mock data.
            </p>
          </div>
        </section>

        <section id="how" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                Three passes, one plan.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Nothing is inferred from a market feed. The only input is the image
                you upload.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="rounded-xl border border-line bg-surface p-5">
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
              <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_50%_40%,rgba(85,47,246,0.2),transparent_65%)] blur-2xl" />
              <img
                src="/screenshot.png"
                alt="ChartCortex workbench showing a segmented chart and a trade plan"
                className="relative w-full rounded-xl border border-line"
              />
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
                  so the calls are never a claim, they are a receipt. The mark, the
                  favicon and the hero art were generated with muse-image-1.0.
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
                <div className="rounded-xl border border-line bg-surface p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Measured
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    Candle highs, lows and clustered levels come from pixels, not from
                    a language model guessing coordinates.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Constrained
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    The plan is enforced by a JSON schema, so the interface always
                    receives a complete, valid object.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Honest
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    Missing panels score zero. If the price axis is unreadable, the plan
                    says so instead of inventing prices.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-5">
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
              No account needed to try it. Upload the chart you are looking at now.
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

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <LogoLockup size={26} />
          <p className="max-w-xl text-[11px] leading-relaxed text-muted">
            Decision support and education only. Not financial advice. No execution and
            no client funds. Chart analysis is generated on demand and does not
            guarantee any outcome.
          </p>
          <a
            href="https://github.com/shyampitamber/ChartCortex"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-muted transition-colors hover:text-ink"
          >
            Source
          </a>
        </div>
      </footer>
    </div>
  );
}
