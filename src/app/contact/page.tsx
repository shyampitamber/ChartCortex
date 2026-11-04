import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { LogoLockup } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact | ChartCortex",
  description:
    "Contact the ChartCortex team. Send a message about the product, the Meta model pipeline, access or partnerships.",
};

export default function ContactPage() {
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
            Terminal
          </Link>
        </div>
        <div className="brand-rule" aria-hidden />
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-5 py-16">
        <p className="font-chivo text-[10px] uppercase tracking-[0.18em] text-muted">
          ChartCortex
        </p>
        <h1 className="mt-3 text-[34px] font-bold tracking-[-0.02em]">Contact</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Questions about the terminal, the Meta model pipeline, access or
          partnerships? Send a message below and it goes straight to the team.
        </p>

        <section className="glass-card mt-10 p-6 sm:p-8">
          <ContactForm />
        </section>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Prefer to read first? The{" "}
          <Link href="/legal" className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60">
            terms, privacy and risk disclosure
          </Link>{" "}
          explain how the service works. ChartCortex is decision support only: no
          execution, no client funds and no financial advice.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
