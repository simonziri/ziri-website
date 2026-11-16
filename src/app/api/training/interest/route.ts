import { NextResponse } from "next/server";
import { getTraining } from "@/data/trainings";
import {
  BEEHIIV_ANSWERED_TAG,
  addPipedriveInterestNote,
  interestHeadline,
  tagBeehiivSubscriber,
  type TrainingInterest,
} from "@/lib/training-integrations";
import {
  describeFailure,
  sendIntegrationAlert,
  type FailedTarget,
} from "@/lib/ziri-alert";

/**
 * Formulare auf der Thank-you-Seite (/training/[slug]/thanks):
 * - kind "loom" (aktuell auf der Seite, seit 03.11.): Anfrage für einen
 *   Gratis-Loom-Review einer Seite. Feld page_url (keine Qualifizierung,
 *   erstmal für alle).
 * - kind "survey" (seit 14.11., TrainingSignupSteps): Firmengröße, Umsatz,
 *   Freitext "warum / was nervt", Audit ja/nein. kind "audit-context": optionaler
 *   Kontext nach "ja".
 * - ohne kind: alte Frage "What topic is burning most right now?"
 *   (Komponente TrainingInterestForm, derzeit nicht eingebunden).
 *
 * - Speichert nichts selbst. Ziel: Notiz an der Person in Pipedrive
 *   (PIPEDRIVE_API_TOKEN) + Benachrichtigung an ZIRI (Resend, sonst Log).
 * - Honeypot "company_website_2" wie bei der Anmeldung.
 *
 * Privacy Policy (Abschnitt 4 "Training sign-up") beschreibt dieses
 * Formular. Bei Änderungen hier mitziehen.
 */

/* Webinar-Mails bewusst NICHT an hello@ (Kontaktformular), sondern media@. */
const CONTACT_TO = process.env.WEBINAR_EMAIL_TO ?? "media@simonziri.com";
const CONTACT_FROM =
  process.env.CONTACT_EMAIL_FROM ?? "ZIRI Website <onboarding@resend.dev>";

const asTrimmed = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;

async function notifyZiri(interest: TrainingInterest): Promise<void> {
  const isLoom = interest.kind === "loom";
  const headline = interestHeadline(interest);
  const text = [
    `${headline} via simonziri.com`,
    ``,
    `Webinar:  ${interest.trainingTitle}`,
    `Email:    ${interest.email}`,
    ``,
    isLoom ? `Request:` : interest.kind === "topic" ? `Burning topic:` : `Answers:`,
    interest.problem,
    ``,
    `Sent at: ${interest.submittedAt}`,
  ].join("\n");

  if (!process.env.RESEND_API_KEY) {
    console.log("[training-interest] submission", interest);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: interest.email,
      subject: isLoom
        ? `Loom review request: ${interest.email}`
        : interest.kind === "topic"
          ? `Webinar input: ${interest.trainingTitle}`
          : `${headline}: ${interest.email}`,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`resend ${response.status}`);
}


/** Loom-Anfrage als lesbarer Text (Mail + Pipedrive-Notiz), null wenn ungültig. */
function describeLoomRequest(payload: Record<string, unknown>): string | null {
  const pageUrl = asTrimmed(payload.page_url, 500);
  if (!pageUrl) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(pageUrl) ? pageUrl : `https://${pageUrl}`);
  } catch {
    return null;
  }
  if (!url.hostname.includes(".")) return null;
  // optional (nur Watch-Seite): mehr Kontext zur Anfrage
  const context = asTrimmed(payload.context, 2000);
  return context ? `Page: ${url.toString()}\n\nContext:\n${context}` : `Page: ${url.toString()}`;
}

/** Fragen nach der Anmeldung (TrainingSignupSteps) als lesbarer Text, null wenn leer. */
function describeSurvey(payload: Record<string, unknown>): string | null {
  const audit = payload.audit === "yes" ? "YES" : payload.audit === "no" ? "no" : null;
  if (!audit) return null;
  return [
    `Free audit: ${audit}`,
    `Company size: ${asTrimmed(payload.company_size, 100) ?? "—"}`,
    `Annual revenue: ${asTrimmed(payload.revenue, 100) ?? "—"}`,
    ``,
    `Why they signed up / what's bugging them:`,
    asTrimmed(payload.pain, 3000) ?? "—",
  ].join("\n");
}

/** Gescheiterte Ziele sammeln. In Production gilt "skipped" (Key fehlt) auch als Fehler. */
function collectFailures(
  results: ReadonlyArray<readonly [string, PromiseSettledResult<unknown>]>,
): FailedTarget[] {
  const failures: FailedTarget[] = [];
  for (const [target, result] of results) {
    if (result.status === "rejected") {
      failures.push({ target, error: describeFailure(result.reason) });
    } else if (
      process.env.VERCEL_ENV === "production" &&
      (result.value as { status?: string } | undefined)?.status === "skipped"
    ) {
      failures.push({ target, error: "skipped (API key missing)" });
    }
  }
  return failures;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (asTrimmed(payload.company_website_2, 1000)) {
    return NextResponse.json({ ok: true });
  }

  const slug = asTrimmed(payload.training, 200);
  const training = slug ? getTraining(slug) : undefined;
  const email = asTrimmed(payload.email, 320);
  const kind: TrainingInterest["kind"] =
    payload.kind === "loom" || payload.kind === "survey" || payload.kind === "audit-context"
      ? payload.kind
      : "topic";
  const problem =
    kind === "loom"
      ? describeLoomRequest(payload)
      : kind === "survey"
        ? describeSurvey(payload)
        : kind === "audit-context"
          ? asTrimmed(payload.context, 3000)
          : asTrimmed(payload.problem, 2000);

  if (
    !training ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !problem
  ) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const interest: TrainingInterest = {
    slug: training.slug,
    trainingId: training.id,
    trainingTitle: training.title,
    email,
    problem,
    submittedAt: new Date().toISOString(),
    kind,
    source: payload.source === "watch" ? "watch" : "thanks",
  };

  const [notified, pipedrive, tagged] = await Promise.allSettled([
    notifyZiri(interest),
    addPipedriveInterestNote(interest),
    // Fragen beantwortet: Mail 2 ("what made you sign up?") überspringt sie
    kind === "survey"
      ? tagBeehiivSubscriber(email, BEEHIIV_ANSWERED_TAG)
      : Promise.resolve({ status: "skipped" as const }),
  ]);

  const failures = collectFailures([
    ["notification", notified],
    ["pipedrive", pipedrive],
    ...(kind === "survey" ? ([["beehiiv tag", tagged]] as const) : []),
  ]);
  for (const { target, error } of failures) {
    console.error(`[training-interest] ${target} failed:`, error);
  }
  await sendIntegrationAlert(
    interestHeadline(interest),
    [
      `Email:    ${interest.email}`,
      `Webinar:  ${interest.trainingTitle} (${interest.slug})`,
      `Answer:   ${interest.problem}`,
    ],
    failures,
  );

  const pipedriveOk =
    pipedrive.status === "fulfilled" && pipedrive.value.status === "ok";
  if (!pipedriveOk && notified.status === "rejected") {
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
