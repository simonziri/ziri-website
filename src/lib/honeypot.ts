/**
 * Honeypot für alle Formulare (Bot-Schutz ohne Captcha).
 *
 * Bis 2026-11-16 hieß das Feld "company_website_2" und eine gefüllte Anfrage
 * wurde still verworfen. Browser-Autofill / Passwort-Manager haben das Feld bei
 * echten Menschen befüllt (Name klingt nach "Firmen-Website"; autoComplete="off"
 * wird von Chrome ignoriert). Folge: echte Anmeldungen gingen spurlos verloren.
 *
 * Jetzt:
 * - Feldname ohne Autofill-Bedeutung (HONEYPOT_FIELD) + Ignore-Attribute für
 *   gängige Passwort-Manager (HONEYPOT_INPUT_PROPS).
 * - Gefüllt -> weiterhin nichts anlegen (keine Mails an den Absender, kein CRM),
 *   aber eine Prüf-Mail an ZIRI mit allen Angaben, damit ein Mensch entscheidet.
 * - Der alte Feldname zählt weiter, solange alte Seiten im Browser-Cache sind.
 */

export const HONEYPOT_FIELD = "hp_x7q";
const LEGACY_FIELDS = ["company_website_2"] as const;

/** Props für das versteckte <input>. Spread in das Element. */
export const HONEYPOT_INPUT_PROPS = {
  name: HONEYPOT_FIELD,
  type: "text",
  tabIndex: -1,
  autoComplete: "off",
  "data-1p-ignore": "true",
  "data-lpignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
} as const;

/** Wert des Honeypots (neuer oder alter Name), sonst null. */
export function honeypotValue(payload: Record<string, unknown>): string | null {
  for (const key of [HONEYPOT_FIELD, ...LEGACY_FIELDS]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim().slice(0, 300);
    }
  }
  return null;
}

const FROM =
  process.env.CONTACT_EMAIL_FROM ?? "ZIRI Website <onboarding@resend.dev>";

/**
 * Prüf-Mail an ZIRI statt stillem Verwerfen. Wirft nie.
 * `to`: Postfach des jeweiligen Formulars (Training -> media@, Kontakt -> hello@).
 */
export async function sendHoneypotNotice(
  form: string,
  to: string,
  payload: Record<string, unknown>,
  filled: string,
): Promise<void> {
  const lines = Object.entries(payload)
    .filter(([key]) => key !== HONEYPOT_FIELD && !(LEGACY_FIELDS as readonly string[]).includes(key))
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value.slice(0, 2000) : JSON.stringify(value)}`);

  const text = [
    `A ${form} submission filled the hidden bot field, so NOTHING was created`,
    `(no beehiiv, no Pipedrive, no email to the person).`,
    ``,
    `If this looks like a real person: add them manually or reply to them.`,
    `If it looks like spam: ignore this mail.`,
    ``,
    `Hidden field value: ${filled}`,
    ``,
    ...lines,
    ``,
    `Received at: ${new Date().toISOString()}`,
  ].join("\n");

  if (!process.env.RESEND_API_KEY) {
    console.warn("[honeypot]", text);
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
        from: FROM,
        to: [to],
        subject: `CHECK: possible bot on ${form} (nothing was created)`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error(`[honeypot] resend ${response.status}`);
  } catch (error) {
    console.error(
      "[honeypot] could not send:",
      error instanceof Error ? error.message : "unknown error",
    );
  }
  console.warn(`[honeypot] ${form}: hidden field filled, notice sent`);
}
