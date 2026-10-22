/**
 * Server-only integrations for the training sign-up (/api/training):
 *
 * - beehiiv (e-mail tool): creates/updates the subscriber so the training
 *   can be sent. Newsletter only with separate opt-in + double opt-in.
 * - Pipedrive (CRM): finds or creates the person, creates a lead and adds a
 *   note with the sign-up details.
 * - Pipedrive (CRM): the thank-you page form ("what should the training
 *   cover?") adds a note to the person.
 *
 * Secrets come from process.env only and are never logged. If a key is
 * missing (e.g. preview deployments), the integration is skipped.
 * Every external call has its own timeout.
 */

const BEEHIIV_API = "https://api.beehiiv.com/v2";
/** Not secret. The ZIRI publication in beehiiv. */
const BEEHIIV_PUBLICATION_ID = "pub_910529e3-bbef-4189-9422-5eb7e794b296";
/**
 * Not secret. Automation "Training signup: confirmation + what made you sign
 * up" (trigger "Add by API"). beehiiv only enrolls API subscribers into
 * automations listed here, the trigger alone does nothing.
 */
const BEEHIIV_TRAINING_AUTOMATION_ID =
  "aut_78b18800-72f8-4aab-b8b5-7f553f550aff";

const PIPEDRIVE_API = "https://api.pipedrive.com";
/**
 * Not secret. Pipedrive custom field "Source Description" (deal/lead field).
 * A Pipedrive automation renames every new lead to "<org> | <person>"
 * (Simon needs it for other leads), so the webinar goes into this field too.
 */
const PIPEDRIVE_SOURCE_DESCRIPTION_KEY =
  "3c9f15324a9e7370294890c7689e842b2c7bee36";

const TIMEOUT_MS = 8000;

export type TrainingSignup = {
  slug: string;
  trainingId: string;
  trainingTitle: string;
  email: string;
  role: string;
  roleLabel: string;
  newsletter: boolean;
  utmSource: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  submittedAt: string;
};

export type IntegrationResult =
  | { status: "skipped" }
  | { status: "ok"; details: Record<string, string | number> };

/** Thrown on non-2xx responses. Carries only the status, never the body. */
class IntegrationError extends Error {
  constructor(step: string, status: number) {
    super(`${step} failed with HTTP ${status}`);
    this.name = "IntegrationError";
  }
}

async function callJson(
  step: string,
  url: string,
  init: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new IntegrationError(step, response.status);
  const body: unknown = await response.json().catch(() => null);
  return { status: response.status, body };
}

const dig = (value: unknown, ...path: string[]): unknown =>
  path.reduce<unknown>(
    (current, key) =>
      current && typeof current === "object"
        ? (current as Record<string, unknown>)[key]
        : undefined,
    value,
  );

/* ------------------------------------------------------------------ */
/* beehiiv                                                            */
/* ------------------------------------------------------------------ */

export async function subscribeToBeehiiv(
  signup: TrainingSignup,
): Promise<IntegrationResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) return { status: "skipped" };

  const body: Record<string, unknown> = {
    email: signup.email,
    reactivate_existing: true,
    send_welcome_email: false,
    // Training only: no double opt-in mail. Newsletter: double opt-in required.
    double_opt_override: signup.newsletter ? "on" : "off",
    referring_site: `simonziri.com/training/${signup.slug}`,
    automation_ids: [BEEHIIV_TRAINING_AUTOMATION_ID],
    // Note: for an existing subscriber, "webinar" is overwritten with the
    // newest slug (acceptable for now).
    custom_fields: [
      { name: "webinar", value: signup.slug },
      { name: "role", value: signup.role },
      { name: "newsletter_optin", value: signup.newsletter },
    ],
  };
  if (signup.utmSource) {
    body.utm_source = signup.utmSource;
    body.utm_medium = "paid_social";
  }
  if (signup.utmCampaign) body.utm_campaign = signup.utmCampaign;
  if (signup.utmContent) body.utm_content = signup.utmContent;

  const { status, body: response } = await callJson(
    "beehiiv subscription",
    `${BEEHIIV_API}/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const subscriptionId = dig(response, "data", "id");

  // beehiiv antwortet auch bei abgelehnten Adressen mit 2xx, legt aber
  // keinen nutzbaren Kontakt an (status "invalid"). Dann Alarm auslösen.
  const subscriptionStatus = dig(response, "data", "status");
  if (subscriptionStatus === "invalid") {
    throw new Error("beehiiv marked the address as invalid (not subscribed)");
  }

  // Tag "webinar:<slug>" pro Anmeldung, additiv: wer sich für zwei anmeldet, hat
  // beide Tags (das Feld "webinar" hält nur das letzte). Versand am
  // Release-Tag pro Tag-Segment.
  if (typeof subscriptionId !== "string") {
    throw new Error("beehiiv subscription returned no id (tag not set)");
  }
  await callJson(
    "beehiiv tag",
    `${BEEHIIV_API}/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriptionId}/tags`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: [`webinar:${signup.slug}`] }),
    },
  );

  return {
    status: "ok",
    details: {
      http: status,
      subscriptionId,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Pipedrive                                                          */
/* ------------------------------------------------------------------ */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type PipedriveHeaders = Record<string, string>;

const pipedriveHeaders = (token: string): PipedriveHeaders => ({
  "x-api-token": token,
  "Content-Type": "application/json",
});

/** Find person by exact e-mail, otherwise create one. */
async function findOrCreatePerson(
  email: string,
  headers: PipedriveHeaders,
): Promise<{ personId: number; personCreated: boolean }> {
  const search = await callJson(
    "pipedrive person search",
    `${PIPEDRIVE_API}/api/v2/persons/search?${new URLSearchParams({
      term: email,
      fields: "email",
      exact_match: "true",
      limit: "1",
    })}`,
    { method: "GET", headers },
  );
  const items = dig(search.body, "data", "items");
  const existingId = Array.isArray(items)
    ? dig(items[0], "item", "id")
    : undefined;

  let personId: number;
  let personCreated = false;
  if (typeof existingId === "number") {
    personId = existingId;
  } else {
    const created = await callJson(
      "pipedrive person create",
      `${PIPEDRIVE_API}/api/v2/persons`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          // We do not collect names; the e-mail local part is a placeholder.
          name: email.split("@")[0],
          emails: [{ value: email, primary: true, label: "work" }],
        }),
      },
    );
    const newId = dig(created.body, "data", "id");
    if (typeof newId !== "number") {
      throw new Error("pipedrive person create returned no id");
    }
    personId = newId;
    personCreated = true;
  }
  return { personId, personCreated };
}

export async function createPipedriveLead(
  signup: TrainingSignup,
): Promise<IntegrationResult> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) return { status: "skipped" };
  const headers = pipedriveHeaders(token);

  // a) Person
  const { personId, personCreated } = await findOrCreatePerson(
    signup.email,
    headers,
  );

  // b) Lead, owned by the token owner (default owner).
  const lead = await callJson(
    "pipedrive lead create",
    `${PIPEDRIVE_API}/v1/leads`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `Webinar: ${signup.trainingId} - ${signup.slug}`,
        person_id: personId,
        [PIPEDRIVE_SOURCE_DESCRIPTION_KEY]: `Webinar: ${signup.trainingId} - ${signup.slug}`,
      }),
    },
  );
  const leadId = dig(lead.body, "data", "id");
  if (typeof leadId !== "string") {
    throw new Error("pipedrive lead create returned no id");
  }

  // c) Note with the sign-up details.
  const lines = [
    `<b>Webinar sign-up via simonziri.com</b>`,
    `Webinar: ${escapeHtml(signup.trainingTitle)}`,
    `ID / slug: ${escapeHtml(signup.trainingId)} / ${escapeHtml(signup.slug)}`,
    `Describes them: ${escapeHtml(signup.roleLabel)}`,
    `Newsletter: ${signup.newsletter ? "yes (double opt-in pending)" : "no"}`,
    `utm_source: ${escapeHtml(signup.utmSource ?? "-")}`,
    `utm_campaign: ${escapeHtml(signup.utmCampaign ?? "-")}`,
    `utm_content: ${escapeHtml(signup.utmContent ?? "-")}`,
    `Signed up at: ${signup.submittedAt}`,
  ];
  const note = await callJson(
    "pipedrive note create",
    `${PIPEDRIVE_API}/v1/notes`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ content: lines.join("<br>"), lead_id: leadId }),
    },
  );
  const noteId = dig(note.body, "data", "id");

  return {
    status: "ok",
    details: {
      personId,
      personCreated: personCreated ? "yes" : "no",
      leadId,
      leadHttp: lead.status,
      ...(typeof noteId === "number" ? { noteId } : {}),
      noteHttp: note.status,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Pipedrive: thank-you page input                                    */
/* ------------------------------------------------------------------ */

export type TrainingInterest = {
  slug: string;
  trainingId: string;
  trainingTitle: string;
  email: string;
  problem: string;
  submittedAt: string;
};

export async function addPipedriveInterestNote(
  interest: TrainingInterest,
): Promise<IntegrationResult> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) return { status: "skipped" };
  const headers = pipedriveHeaders(token);

  const { personId } = await findOrCreatePerson(interest.email, headers);

  const lines = [
    `<b>Webinar input (thank-you page)</b>`,
    `Webinar: ${escapeHtml(interest.trainingTitle)}`,
    `ID / slug: ${escapeHtml(interest.trainingId)} / ${escapeHtml(interest.slug)}`,
    ``,
    `<b>Burning topic:</b>`,
    escapeHtml(interest.problem).replace(/\n/g, "<br>"),
    ``,
    `Sent at: ${interest.submittedAt}`,
  ];
  const note = await callJson(
    "pipedrive interest note create",
    `${PIPEDRIVE_API}/v1/notes`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ content: lines.join("<br>"), person_id: personId }),
    },
  );
  const noteId = dig(note.body, "data", "id");
  return {
    status: "ok",
    details: {
      personId,
      ...(typeof noteId === "number" ? { noteId } : {}),
    },
  };
}
