/**
 * Gratis-Audit-Termine über die öffentliche Cal.com-API v2 (Simon 23.11.).
 *
 * Unser eigener Kalender (components/audit-calendar.tsx) spricht nur mit
 * unseren Routen /api/audit/slots und /api/audit/book; die rufen Cal.com
 * serverseitig auf. So lädt der Browser kein Cal.com-Script und Cal.com
 * bekommt erst beim Buchen Name, Adresse und Notizen.
 *
 * Event: AUDIT_CAL_LINK ("<username>/<slug>") in data/trainings.ts. Zeiten,
 * Dauer, Mindestvorlauf (3 h) und Google Meet stehen in Cal.com, nicht hier.
 * Für Slots und Buchung braucht es keinen API-Key (öffentliches Event).
 */
import { AUDIT_CAL_LINK } from "@/data/trainings";

const API = "https://api.cal.com/v2";
const [USERNAME, EVENT_SLUG] = AUDIT_CAL_LINK.split("/");

export type AuditSlots = Record<string, string[]>;

export async function fetchAuditSlots(
  start: string,
  end: string,
  timeZone: string,
): Promise<AuditSlots> {
  const params = new URLSearchParams({
    eventTypeSlug: EVENT_SLUG,
    username: USERNAME,
    start,
    end,
    timeZone,
  });
  const response = await fetch(`${API}/slots?${params}`, {
    headers: { "cal-api-version": "2024-09-04" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`cal slots ${response.status}`);
  const json = (await response.json()) as {
    data?: Record<string, { start: string }[]>;
  };
  const slots: AuditSlots = {};
  for (const [day, list] of Object.entries(json.data ?? {})) {
    slots[day] = list.map((slot) => slot.start);
  }
  return slots;
}

export type AuditBooking = {
  start: string;
  name: string;
  email: string;
  timeZone: string;
  notes?: string;
};

export type AuditBookingResult =
  | { status: "ok"; start: string; meetingUrl: string | null; uid: string | null }
  | { status: "taken" }
  | { status: "bad-email" }
  | { status: "error"; detail: string };

export async function createAuditBooking(booking: AuditBooking): Promise<AuditBookingResult> {
  const response = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: {
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start: new Date(booking.start).toISOString(),
      eventTypeSlug: EVENT_SLUG,
      username: USERNAME,
      attendee: {
        name: booking.name,
        email: booking.email,
        timeZone: booking.timeZone,
        language: "en",
      },
      // Ohne location bucht die API mit Cal Video statt dem Google Meet des Events
      location: { type: "integration", integration: "google-meet" },
      ...(booking.notes ? { bookingFieldsResponses: { notes: booking.notes } } : {}),
    }),
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) {
    // Slot inzwischen vergeben / nicht mehr verfügbar
    if (response.status === 409 || /no.*available|already.*booked|not available/i.test(text)) {
      return { status: "taken" };
    }
    if (/email_domain_cannot_receive_mail|cannot receive mail/i.test(text)) {
      return { status: "bad-email" };
    }
    return { status: "error", detail: `${response.status} ${text.slice(0, 500)}` };
  }
  let meetingUrl: string | null = null;
  let uid: string | null = null;
  try {
    const data = (JSON.parse(text) as { data?: { meetingUrl?: string; location?: string; uid?: string } }).data;
    meetingUrl = data?.meetingUrl ?? (data?.location?.startsWith("http") ? data.location : null);
    uid = data?.uid ?? null;
  } catch {
    // Antwort nicht lesbar: Buchung ist trotzdem durch (200)
  }
  return { status: "ok", start: booking.start, meetingUrl, uid };
}
