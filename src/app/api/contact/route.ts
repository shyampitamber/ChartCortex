import { NextResponse } from "next/server";

const TO = process.env.CONTACT_TO ?? "shyampitamber5777@gmail.com";
const FROM =
  process.env.CONTACT_FROM ?? "ChartCortex <contact@ascendforex.com>";
const MAX = { name: 80, email: 160, message: 4000 };

type Payload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
};

const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

function allowed(key: string) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (clean(body.company, 40)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email).toLowerCase();
  const message = clean(body.message, MAX.message);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Please add a valid email address." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please add a little more detail to your message." },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!allowed(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Messaging is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const text = [
    "New message from the ChartCortex contact form.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const html = [
    '<div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6">',
    "<h2 style=\"margin:0 0 12px\">New contact form message</h2>",
    `<p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p style="margin:0 0 16px"><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>`,
    "</div>",
  ].join("");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `ChartCortex contact: ${name}`,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Contact send failed", response.status, detail);
      return NextResponse.json(
        { error: "The message could not be sent. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact send error", error);
    return NextResponse.json(
      { error: "The message could not be sent. Please try again." },
      { status: 502 },
    );
  }
}
