import { NextResponse } from "next/server";

/**
 * Contact form endpoint — GDPR-minded by design:
 *
 * - Stores nothing. Submissions are forwarded, never persisted here.
 * - Delivery is a pluggable seam: set CONTACT_WEBHOOK_URL (Vercel env)
 *   to forward submissions as JSON to any endpoint you control —
 *   Slack webhook, Make/Zapier, your CRM, an email service. Without
 *   it, submissions are logged to the server console only (dev mode).
 * - The honeypot field ("website") silently discards bot submissions.
 */

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown; // Honeypot — Menschen lassen das Feld leer.
};

const isNonEmptyString = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot gefüllt → Bot. Stilles OK, kein Hinweis an den Absender.
  if (isNonEmptyString(payload.website, 1000)) {
    return NextResponse.json({ ok: true });
  }

  const valid =
    isNonEmptyString(payload.name, 200) &&
    isNonEmptyString(payload.email, 320) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email as string) &&
    isNonEmptyString(payload.message, 5000) &&
    payload.consent === true;

  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const submission = {
    name: (payload.name as string).trim(),
    email: (payload.email as string).trim(),
    message: (payload.message as string).trim(),
    submittedAt: new Date().toISOString(),
    source: "ziri-website/contact",
  };

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!response.ok) throw new Error(`webhook ${response.status}`);
    } catch (error) {
      console.error("[contact] delivery failed", error);
      return NextResponse.json(
        { ok: false, error: "delivery" },
        { status: 502 },
      );
    }
  } else {
    // Kein Ziel konfiguriert: nur Server-Log (Entwicklung).
    console.log("[contact] submission", submission);
  }

  return NextResponse.json({ ok: true });
}
