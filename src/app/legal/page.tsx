import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export default function LegalPage() {
  return (
    <div className="relative min-h-screen bg-canvas">
      <div className="aurora" aria-hidden>
        <div className="aurora-blob aurora-blob-a" />
        <div className="aurora-blob aurora-blob-b" />
        <div className="aurora-blob aurora-blob-c" />
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="ChartCortex home">
            <LogoLockup size={36} />
          </Link>
          <Link href="/scan" className="btn btn-teal btn-sm">
            Open the app
          </Link>
        </div>
        <div className="brand-rule" aria-hidden />
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-5 py-16">
        <p className="font-chivo text-[10px] uppercase tracking-[0.18em] text-muted">
          ChartCortex
        </p>
        <h1 className="mt-3 text-[34px] font-bold tracking-[-0.02em]">Legal</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Plain language terms for a decision support tool. ChartCortex does not
          execute trades, hold client funds or provide financial advice.
        </p>

        <section id="terms" className="glass-card mt-10 p-6">
          <h2 className="text-xl font-bold">Terms of use</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            ChartCortex provides chart analysis and trade structure for
            information and education. You are responsible for every decision you
            take. The service is provided as is, without warranties of
            availability, accuracy or fitness for a particular purpose. You may
            not resell, scrape or present the output as advice from a regulated
            professional.
          </p>
        </section>

        <section id="privacy" className="glass-card mt-4 p-6">
          <h2 className="text-xl font-bold">Privacy</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            To produce an analysis, the live chart image and the candle data for
            the instrument you select are sent to the Meta Model API. We do not
            sell personal data. We keep only the minimum needed to operate the
            service and to diagnose failures. No account is required to analyse
            a chart. For requests about your data, contact
            hello@ascendforex.com.
          </p>
        </section>

        <section id="risk" className="glass-card mt-4 p-6">
          <h2 className="text-xl font-bold">Risk disclosure</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Trading foreign exchange, indices, metals, energies and other
            leveraged products carries a high risk of loss. Past performance and
            historical chart structure do not guarantee future results.
            ChartCortex produces decision support, not a recommendation to trade.
            No execution, no client funds and no signal group. Never risk capital
            you cannot afford to lose.
          </p>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Questions: hello@ascendforex.com
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
