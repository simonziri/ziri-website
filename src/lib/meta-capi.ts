import { createHash, randomUUID } from "node:crypto";

/**
 * Meta Conversions API, direkt vom Server (Simons Entscheidung 27.10.).
 *
 * - Jede qualifizierte Anmeldung geht als "Lead" an Meta, unabhängig vom
 *   Cookie-Banner. Der Browser sieht davon nichts (Server → graph.facebook.com).
 * - Abgleich über gehashte E-Mail/Name/Telefon (SHA-256), IP, User-Agent und
 *   fbc aus dem fbclid der Ad-URL (kein Cookie).
 * - Env: META_CAPI_TOKEN (Pflicht, sonst "skipped"), META_PIXEL_ID (Default
 *   ZIRI Pixel), META_TEST_EVENT_CODE (optional, nur zum Testen im Events
 *   Manager), META_GRAPH_VERSION (optional).
 * - Der Pixel-Lead-Tag in GTM sollte pausiert sein, sonst zählt Meta
 *   Anmeldungen mit Marketing-Consent doppelt (keine gemeinsame event_id).
 */

const PIXEL_ID = process.env.META_PIXEL_ID ?? "1341846634534221";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0";
const TIMEOUT_MS = 8000;

export type MetaLead = {
  request: Request;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  fbclid?: string | null;
  /** Für die Auswertung in Meta, z. B. Training-Slug oder "website-umzug". */
  contentName: string;
};

export type MetaResult = { status: "ok" } | { status: "skipped" };

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const normalize = (value: string | null | undefined) =>
  value ? value.trim().toLowerCase() : "";

/* Nur Ziffern mit Ländervorwahl; deutsche 0… → 49… (Umzug-Seite ist DACH). */
function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `49${digits.slice(1)}`;
  return digits;
}

export async function sendMetaLead(lead: MetaLead): Promise<MetaResult> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return { status: "skipped" };

  const { request } = lead;
  const now = Date.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent");
  const pageUrl = request.headers.get("referer");

  const userData: Record<string, unknown> = {
    em: [sha256(normalize(lead.email))],
  };
  const fn = normalize(lead.firstName);
  const ln = normalize(lead.lastName);
  const ph = normalizePhone(lead.phone);
  if (fn) userData.fn = [sha256(fn)];
  if (ln) userData.ln = [sha256(ln)];
  if (ph) userData.ph = [sha256(ph)];
  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;
  if (lead.fbclid) userData.fbc = `fb.1.${now}.${lead.fbclid}`;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(now / 1000),
        event_id: randomUUID(),
        action_source: "website",
        ...(pageUrl ? { event_source_url: pageUrl } : {}),
        user_data: userData,
        custom_data: { content_name: lead.contentName },
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  // Nur Status loggen/werfen, nie den Body (könnte Token-Infos enthalten).
  if (!response.ok) throw new Error(`meta capi ${response.status}`);
  return { status: "ok" };
}
