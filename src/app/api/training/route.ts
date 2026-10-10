import { NextResponse } from "next/server";
import { getTraining, TRAINING_ROLES } from "@/data/trainings";

/**
 * Training-Sign-up-Endpoint (Webinar-Lead-Magnets, /training/[slug]).
 * Gleiches Muster wie src/app/api/contact/route.ts:
 *
 * - Speichert nichts. Submissions werden nur weitergeleitet.
 * - Zustellung, env-gesteuert, in dieser Reihenfolge:
 *     1. RESEND_API_KEY      → E-Mail an CONTACT_EMAIL_TO (Benachrichtigung
 *                              an ZIRI, KEINE Mail an den Lead)
 *     2. CONTACT_WEBHOOK_URL → JSON-POST (source: "ziri-website/training")
 *     3. nichts gesetzt      → Server-Log (Dev-Fallback)
 * - Honeypot "company_website_2" verwirft Bots still.
 *
 * TODO: Bestätigungs-/Zustellmail an den Lead kommt später. Dann Privacy
 * Policy (Abschnitt "Training sign-up") prüfen.
 */

const CONTACT_TO = process.env.CONTACT_EMAIL_TO ?? "hello@simonziri.com";
const CONTACT_FROM =
  process.env.CONTACT_EMAIL_FROM ?? "ZIRI Website <onboarding@resend.dev>";

type Payload = Record<string, unknown>;

const asTrimmed = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;

const ROLE_VALUES: readonly string[] = TRAINING_ROLES.map(
  (option) => option.value,
);

const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
) => options.find((option) => option.value === value)?.label ?? value;

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

  const slug = asTrimmed(payload.training, 200);
  const training = slug ? getTraining(slug) : undefined;
  const email = asTrimmed(payload.email, 320);
  const role = asTrimmed(payload.role, 100);
  const utmSource = asTrimmed(payload.utm_source, 200);
  const utmCampaign = asTrimmed(payload.utm_campaign, 200);
  const utmContent = asTrimmed(payload.utm_content, 200);

  const valid =
    training !== undefined &&
    email !== null &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    role !== null &&
    ROLE_VALUES.includes(role) &&
    payload.consent === true;

  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const submission = {
    training: training.slug,
    trainingId: training.id,
    trainingTitle: training.title,
    email,
    role,
    newsletter: payload.newsletter === true,
    utm: {
      source: utmSource ?? "-",
      campaign: utmCampaign ?? "-",
      content: utmContent ?? "-",
    },
    submittedAt: new Date().toISOString(),
    source: "ziri-website/training",
  };

  try {
    if (process.env.RESEND_API_KEY) {
      const text = [
        `New training signup via simonziri.com`,
        ``,
        `Training:     ${training.title}`,
        `ID / slug:    ${training.id} / ${training.slug}`,
        ``,
        `Email:        ${submission.email}`,
        `Role:         ${labelFor(TRAINING_ROLES, role)}`,
        `Newsletter:   ${submission.newsletter ? "yes (needs double opt-in)" : "no"}`,
        ``,
        `utm_source:   ${submission.utm.source}`,
        `utm_campaign: ${submission.utm.campaign}`,
        `utm_content:  ${submission.utm.content}`,
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
          subject: `Training signup: ${training.title}`,
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
      console.log("[training] submission", submission);
    }
  } catch (error) {
    console.error("[training] delivery failed", error);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
