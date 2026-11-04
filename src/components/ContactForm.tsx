"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-2 w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50 focus:ring-1 focus:ring-accent/25";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"),
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setError(payload.error ?? "The message could not be sent.");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("The message could not be sent. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-teal/25 bg-teal/[0.06] p-6">
        <p className="font-chivo text-[11px] font-bold uppercase tracking-[0.18em] text-teal">
          Message sent
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Thanks for writing in. Your message is on its way and you will get a
          reply at the email address you left.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-ink underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="font-chivo text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Your name
          </span>
          <input
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Alex Morgan"
            className={field}
          />
        </label>
        <label className="block">
          <span className="font-chivo text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            autoComplete="email"
            placeholder="you@example.com"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="font-chivo text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={7}
          maxLength={4000}
          placeholder="What can we help with?"
          className={`${field} resize-y`}
        />
      </label>

      <div className="hidden" aria-hidden>
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" ? (
        <p className="rounded-lg border border-pink/30 bg-pink/[0.06] px-3.5 py-2.5 text-[13px] text-pink">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-teal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending" : "Send message"}
        </button>
        <p className="text-[11px] leading-relaxed text-muted/80">
          We reply to the address you leave here.
        </p>
      </div>
    </form>
  );
}
