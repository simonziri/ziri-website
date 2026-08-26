import { NextResponse } from "next/server";

/**
 * Contact/qualification form endpoint — GDPR-minded by design:
 *
 * - Stores nothing. Submissions are forwarded, never persisted here.
 * - Delivery seams, in priority order (all env-driven, see CLAUDE.md):
 *     1. RESEND_API_KEY   → e-mail via Resend to CONTACT_EMAIL_TO
 *                           (default: simon+contact@simonziri.com)
 *     2. CONTACT_WEBHOOK_URL → JSON POST to any endpoint you control
 *     3. neither set      → server console log (dev fallback)
 * - The honeypot field ("company_website_2") silently discards bots.
 */

const CONTACT_TO = process.env.CONTACT_EMAIL_TO ?? "hello@simonziri.com";
const CONTACT_FROM =
  process.env.CONTACT_EMAIL_FROM ?? "ZIRI Website <onboarding@resend.dev>";

type Payload = Record<string, unknown>;

const asTrimmed = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot gefüllt → Bot. Stilles OK, kein Hinweis an den Absender.
  if (asTrimmed(payload.company_website_2, 1000)) {
    return NextResponse.json({ ok: true });
  }

  const email = asTrimmed(payload.email, 320);
  const bottleneck = asTrimmed(payload.bottleneck, 200);
  const dealSize = asTrimmed(payload.dealSize, 100);
  const timeline = asTrimmed(payload.timeline, 100);
  const website = asTrimmed(payload.website, 320);
  const message = asTrimmed(payload.message, 5000);

  const valid =
    email !== null &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    bottleneck !== null &&
    dealSize !== null &&
    timeline !== null &&
    payload.consent === true;

  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const submission = {
    email,
    bottleneck,
    dealSize,
    timeline,
    website: website ?? "—",
    message: message ?? "—",
    submittedAt: new Date().toISOString(),
    source: "ziri-website/contact",
  };

  try {
    if (process.env.RESEND_API_KEY) {
      const text = [
        `New inquiry via simonziri.com`,
        ``,
        `Email:        ${submission.email}`,
        `Website:      ${submission.website}`,
        `Bottleneck:   ${submission.bottleneck}`,
        `Deal size:    ${submission.dealSize}`,
        `Timeline:     ${submission.timeline}`,
        ``,
        `Message:`,
        submission.message,
        ``,
        `Submitted at: ${submission.submittedAt}`,
      ].join("\n");

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: CONTACT_FROM,
          to: [CONTACT_TO],
          reply_to: submission.email,
          subject: `New inquiry — ${submission.email}`,
          text,
        }),
      });
      if (!response.ok) throw new Error(`resend ${response.status}`);
    } else if (process.env.CONTACT_WEBHOOK_URL) {
      const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!response.ok) throw new Error(`webhook ${response.status}`);
    } else {
      // Kein Ziel konfiguriert: nur Server-Log (Entwicklung).
      console.log("[contact] submission", submission);
    }
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
