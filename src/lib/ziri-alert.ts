/**
 * Alarm-Mail an ZIRI (media@), wenn bei einer Training-Anmeldung eine Integration
 * (beehiiv, Pipedrive, Benachrichtigung) scheitert. Damit geht niemand still
 * verloren: die Mail sagt, wer betroffen ist und was manuell nachzuziehen ist.
 *
 * Läuft über Resend (RESEND_API_KEY). Ohne Key oder wenn Resend selbst
 * ausfällt: nur Server-Log. Wirft nie.
 */

/* Webinar-Mails bewusst NICHT an hello@ (Kontaktformular), sondern media@. */
const CONTACT_TO = process.env.WEBINAR_EMAIL_TO ?? "media@simonziri.com";
const CONTACT_FROM =
  process.env.CONTACT_EMAIL_FROM ?? "ZIRI Website <onboarding@resend.dev>";

export type FailedTarget = { target: string; error: string };

export const describeFailure = (reason: unknown): string =>
  reason instanceof Error ? `${reason.name}: ${reason.message}` : "unknown error";

export async function sendIntegrationAlert(
  context: string,
  details: string[],
  failures: FailedTarget[],
): Promise<void> {
  if (failures.length === 0) return;

  const text = [
    `Something failed during: ${context}`,
    `Please add the missing parts manually.`,
    ``,
    ...details,
    ``,
    `Failed:`,
    ...failures.map(({ target, error }) => `- ${target}: ${error}`),
    ``,
    `Details: Vercel → ziri-website → Logs.`,
  ].join("\n");

  if (!process.env.RESEND_API_KEY) {
    console.error("[alert]", text);
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        subject: `ALERT: ${context} failed (${failures
          .map((f) => f.target)
          .join(", ")})`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error(`[alert] resend ${response.status}`);
  } catch (error) {
    console.error("[alert] could not send:", describeFailure(error));
  }
}
