import { NextResponse } from "next/server";
import { sendMetaLead } from "@/lib/meta-capi";
import { createPipedriveUmzugLead } from "@/lib/training-integrations";

/**
 * Anfrage von der Landingpage /website-umzug (3-Schritt-Formular).
 *
 * - Speichert nichts auf dem Server. Submissions werden weitergeleitet:
 *     1. E-Mail via Resend an CONTACT_EMAIL_TO (reply_to = Absender), sonst
 *        CONTACT_WEBHOOK_URL, sonst Server-Log (Dev-Fallback)
 *     2. Pipedrive: Person + Lead + Notiz (PIPEDRIVE_API_TOKEN, sonst übersprungen)
 *     3. Meta CAPI: Lead-Event vom Server (META_CAPI_TOKEN, sonst übersprungen)
 * - Honeypot "company_website_2" verwirft Bots still.
 * - Felder: Seitenanzahl, URL, E-Mail, Telefon, Startzeitpunkt,
 *   Budget-Bestätigung, Einwilligung, UTM-Parameter.
 *
 * Privacy Policy: Abschnitt 4a (#website-umzug). Bei Änderungen an Feldern
 * oder Empfängern dort mitziehen.
 */

const CONTACT_TO = process.env.CONTACT_EMAIL_TO ?? "hello@simonziri.com";
const CONTACT_FROM =
  process.env.CONTACT_EMAIL_FROM ?? "ZIRI Website <onboarding@resend.dev>";

type Payload = Record<string, unknown>;

const asTrimmed = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;

/* Domain mit Punkt, optional Protokoll und Pfad (z. B. deinefirma.de) */
const URL_PATTERN = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;
/* Ziffern, Leerzeichen, +, -, /, Klammern; mindestens 6 Ziffern */
const PHONE_PATTERN = /^[+\d\s()/-]{6,40}$/;

const PAGE_LABELS: Record<string, string> = {
  "bis-15": "Bis 15 Seiten",
  "ueber-15": "Über 15 Seiten",
  unklar: "Weiß ich nicht",
};

const START_OPTIONS = ["Diese Woche", "Nächste Woche", "Später"];

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
  const url = asTrimmed(payload.url, 320);
  const phone = asTrimmed(payload.phone, 40);
  const pages = asTrimmed(payload.pages, 20);
  const start = asTrimmed(payload.start, 40);

  const valid =
    email !== null &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    url !== null &&
    URL_PATTERN.test(url) &&
    phone !== null &&
    PHONE_PATTERN.test(phone) &&
    (phone.match(/\d/g)?.length ?? 0) >= 6 &&
    pages !== null &&
    pages in PAGE_LABELS &&
    start !== null &&
    START_OPTIONS.includes(start) &&
    payload.budget === true &&
    payload.consent === true;

  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const submission = {
    email,
    url,
    phone,
    pagesLabel: PAGE_LABELS[pages],
    start,
    budgetConfirmed: true,
    utmSource: asTrimmed(payload.utm_source, 200),
    utmCampaign: asTrimmed(payload.utm_campaign, 200),
    utmContent: asTrimmed(payload.utm_content, 200),
    fbclid: asTrimmed(payload.fbclid, 500),
    submittedAt: new Date().toISOString(),
  };

  // 1) Benachrichtigung (Pflicht: schlägt sie fehl, bekommt der Nutzer einen Fehler)
  try {
    if (process.env.RESEND_API_KEY) {
      const text = [
        `Neue Anfrage Website-Umzug über simonziri.com/website-umzug`,
        ``,
        `Website:  ${submission.url}`,
        `Seiten:   ${submission.pagesLabel}`,
        `E-Mail:   ${submission.email}`,
        `Telefon:  ${submission.phone}`,
        `Start:    ${submission.start}`,
        `Budget bestätigt: ja`,
        ``,
        `utm_source:   ${submission.utmSource ?? "-"}`,
        `utm_campaign: ${submission.utmCampaign ?? "-"}`,
        `utm_content:  ${submission.utmContent ?? "-"}`,
        ``,
        `Eingegangen: ${submission.submittedAt}`,
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
          subject: `Website-Umzug (${submission.pagesLabel}): ${submission.url}`,
          text,
        }),
      });
      if (!response.ok) throw new Error(`resend ${response.status}`);
    } else if (process.env.CONTACT_WEBHOOK_URL) {
      const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...submission, source: "ziri-website/website-umzug" }),
      });
      if (!response.ok) throw new Error(`webhook ${response.status}`);
    } else {
      // Kein Ziel konfiguriert: nur Server-Log (Entwicklung).
      console.log("[website-umzug] submission", submission);
    }
  } catch (error) {
    console.error("[website-umzug] delivery failed", error);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  // 2) CRM + 3) Meta (optional: Fehler hier blockieren die Anfrage nicht, die Mail ist schon raus)
  const [pipedrive, meta] = await Promise.allSettled([
    createPipedriveUmzugLead(submission),
    sendMetaLead({
      request,
      email,
      phone,
      fbclid: submission.fbclid,
      contentName: "website-umzug",
    }),
  ]);
  if (pipedrive.status === "rejected") {
    console.error("[website-umzug] pipedrive failed", pipedrive.reason);
  }
  if (meta.status === "rejected") {
    const reason = meta.reason;
    console.error(
      "[website-umzug] meta failed:",
      reason instanceof Error ? reason.message : "unknown error",
    );
  }

  return NextResponse.json({ ok: true });
}
