import { NextResponse } from "next/server";
import { getTraining, TRAINING_ROLES, type Training } from "@/data/trainings";
import {
  createPipedriveLead,
  subscribeToBeehiiv,
  type TrainingSignup,
} from "@/lib/training-integrations";
import { isFreeEmail } from "@/lib/work-email";
import {
  describeFailure,
  sendIntegrationAlert,
  type FailedTarget,
} from "@/lib/ziri-alert";

/**
 * Training-Sign-up-Endpoint (Webinar-Lead-Magnets, /training/[slug]).
 * Gleiches Muster wie src/app/api/contact/route.ts:
 *
 * - Speichert nichts. Submissions werden nur weitergeleitet.
 * - Zustellung, env-gesteuert, in dieser Reihenfolge:
 *     1. RESEND_API_KEY      → E-Mail an WEBINAR_EMAIL_TO / media@ (Benachrichtigung
 *                              an ZIRI, KEINE Mail an den Lead)
 *     2. CONTACT_WEBHOOK_URL → JSON-POST (source: "ziri-website/training")
 *     3. nichts gesetzt      → Server-Log (Dev-Fallback)
 * - Parallel dazu (src/lib/training-integrations.ts, je nur wenn Key gesetzt):
 *     - beehiiv   (BEEHIIV_API_KEY)     → Subscriber anlegen/aktualisieren;
 *                                          Double-Opt-in nur bei Newsletter
 *     - Pipedrive (PIPEDRIVE_API_TOKEN) → Person finden/anlegen, Lead + Notiz
 *   Alle drei laufen unabhängig (Promise.allSettled). Antwort 200, wenn
 *   beehiiv ODER die Benachrichtigung geklappt hat.
 * - Honeypot "company_website_2" verwirft Bots still.
 *
 * Privacy Policy (Abschnitt 4 "Training sign-up") beschreibt beehiiv und
 * Pipedrive. Bei Änderungen hier mitziehen.
 */

/* Webinar-Mails bewusst NICHT an hello@ (Kontaktformular), sondern media@. */
const CONTACT_TO = process.env.WEBINAR_EMAIL_TO ?? "media@simonziri.com";
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

type Submission = {
  training: string;
  trainingId: string;
  trainingTitle: string;
  email: string;
  role: string;
  newsletter: boolean;
  utm: { source: string; campaign: string; content: string };
  submittedAt: string;
  source: string;
};

/** Benachrichtigung an ZIRI: Resend → Webhook → Server-Log. Wirft bei Fehler. */
async function notifyZiri(
  submission: Submission,
  training: Training,
  role: string,
): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    const text = [
      `New webinar signup via simonziri.com`,
      ``,
      `Webinar:      ${training.title}`,
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
        subject: `Webinar signup: ${training.title}`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`resend ${response.status}`);
  } else if (process.env.CONTACT_WEBHOOK_URL) {
    const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`webhook ${response.status}`);
  } else {
    // Kein Ziel konfiguriert: nur Server-Log (Entwicklung).
    console.log("[training] submission", submission);
  }
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

  // Nur Firmen-Adressen (gleiche Liste wie im Formular).
  if (isFreeEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "work_email" },
      { status: 400 },
    );
  }

  const submission: Submission = {
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

  const signup: TrainingSignup = {
    slug: training.slug,
    trainingId: training.id,
    trainingTitle: training.title,
    email,
    role,
    roleLabel: labelFor(TRAINING_ROLES, role),
    newsletter: submission.newsletter,
    utmSource,
    utmCampaign,
    utmContent,
    submittedAt: submission.submittedAt,
  };

  // Alle drei Ziele unabhängig voneinander; eins darf ausfallen.
  const [notified, beehiiv, pipedrive] = await Promise.allSettled([
    notifyZiri(submission, training, role),
    subscribeToBeehiiv(signup),
    createPipedriveLead(signup),
  ]);

  const logFailure = (
    target: string,
    result: PromiseSettledResult<unknown>,
  ) => {
    if (result.status === "rejected") {
      const reason = result.reason;
      // Nur Name + Message (enthält Status, nie Response-Bodies oder Keys).
      console.error(
        `[training] ${target} failed:`,
        reason instanceof Error
          ? `${reason.name}: ${reason.message}`
          : "unknown error",
      );
    }
  };
  logFailure("notification", notified);
  logFailure("beehiiv", beehiiv);
  logFailure("pipedrive", pipedrive);

  // Alarm an ZIRI, damit niemand still verloren geht (wirft nie).
  await sendIntegrationAlert(
    "webinar signup",
    [
      `Email:    ${email}`,
      `Webinar:  ${training.title} (${training.slug})`,
      `Role:     ${signup.roleLabel}`,
      `Time:     ${submission.submittedAt}`,
    ],
    collectFailures([
      ["notification", notified],
      ["beehiiv", beehiiv],
      ["pipedrive", pipedrive],
    ]),
  );

  // OK, wenn der Lead das Training bekommt (beehiiv) ODER Simon informiert
  // wurde und manuell nachziehen kann.
  const beehiivOk =
    beehiiv.status === "fulfilled" && beehiiv.value.status === "ok";
  if (!beehiivOk && notified.status === "rejected") {
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
