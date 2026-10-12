import { NextResponse } from "next/server";
import { getTraining } from "@/data/trainings";
import {
  addPipedriveInterestNote,
  type TrainingInterest,
} from "@/lib/training-integrations";
import {
  describeFailure,
  sendIntegrationAlert,
  type FailedTarget,
} from "@/lib/ziri-alert";

/**
 * Formular auf der Thank-you-Seite (/training/[slug]/thanks):
 * "What topic is burning most right now?" (ein Textfeld). Wir nehmen das
 * Training gerade erst auf, die Antworten fließen ins Skript.
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
  const text = [
    `Webinar input via simonziri.com (thank-you page)`,
    ``,
    `Webinar:  ${interest.trainingTitle}`,
    `Email:    ${interest.email}`,
    ``,
    `Burning topic:`,
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
      subject: `Webinar input: ${interest.trainingTitle}`,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`resend ${response.status}`);
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
  const problem = asTrimmed(payload.problem, 2000);

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
  };

  const [notified, pipedrive] = await Promise.allSettled([
    notifyZiri(interest),
    addPipedriveInterestNote(interest),
  ]);

  const failures = collectFailures([
    ["notification", notified],
    ["pipedrive", pipedrive],
  ]);
  for (const { target, error } of failures) {
    console.error(`[training-interest] ${target} failed:`, error);
  }
  await sendIntegrationAlert(
    "thank-you page input",
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
