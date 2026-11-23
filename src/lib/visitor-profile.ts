import { readConsent } from "@/lib/consent";
import { TRAINING_EMAIL_STORAGE_KEY, TRAINING_PROFILE_STORAGE_KEY } from "@/data/trainings";

/*
 * Was jemand in unsere Trainings-Formulare getippt hat (Simon 23.11.: so
 * wenig Schritte wie möglich, alles Erlaubte merken).
 *
 * - Immer: sessionStorage, nur dieser Tab (Anmeldung -> Thank-you-Seite).
 *   Unbedingt erforderlich für den mehrstufigen Ablauf, keine Einwilligung
 *   nötig (§ 25 Abs. 2 Nr. 2 TDDDG).
 * - Zusätzlich localStorage (bleibt über Besuche, z. B. Watch-Seite aus der
 *   Mail): NUR mit Einwilligung "Preferences" im Consent-Banner. Wird die
 *   entzogen, löscht clearRememberedProfile() den Eintrag.
 * - Nie in URL oder Cookie, nichts geht an einen Server, bevor jemand ein
 *   Formular abschickt. Datenschutzerklärung Abschnitt 4 + 8.
 */

export type VisitorProfile = {
  email?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  role?: string;
  size?: string;
  revenue?: string;
  pain?: string;
};

export const REMEMBERED_PROFILE_KEY = "ziri:profile";

const FIELDS: ReadonlyArray<keyof VisitorProfile> = [
  "email",
  "first_name",
  "last_name",
  "company",
  "role",
  "size",
  "revenue",
  "pain",
];

function clean(value: unknown): VisitorProfile {
  if (!value || typeof value !== "object") return {};
  const out: VisitorProfile = {};
  for (const field of FIELDS) {
    const v = (value as Record<string, unknown>)[field];
    if (typeof v === "string" && v.trim()) out[field] = v.slice(0, 3000);
  }
  return out;
}

function readJson(storage: Storage, key: string): VisitorProfile {
  try {
    const raw = storage.getItem(key);
    return raw ? clean(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function mayRemember(): boolean {
  return readConsent()?.choices.preferences === true;
}

/** Tab zuerst (neuer), sonst gemerkte Angaben (nur mit Einwilligung). */
export function readProfile(): VisitorProfile {
  let remembered: VisitorProfile = {};
  let session: VisitorProfile = {};
  let sessionEmail: string | null = null;
  try {
    if (mayRemember()) remembered = readJson(window.localStorage, REMEMBERED_PROFILE_KEY);
  } catch {
    remembered = {};
  }
  try {
    session = readJson(window.sessionStorage, TRAINING_PROFILE_STORAGE_KEY);
    sessionEmail = window.sessionStorage.getItem(TRAINING_EMAIL_STORAGE_KEY);
  } catch {
    session = {};
  }
  return { ...remembered, ...session, ...(sessionEmail ? { email: sessionEmail } : {}) };
}

/** Neue Angaben dazuschreiben (Tab immer, Gerät nur mit Einwilligung). */
export function saveProfile(patch: VisitorProfile): void {
  const next = clean({ ...readProfile(), ...patch });
  try {
    window.sessionStorage.setItem(TRAINING_PROFILE_STORAGE_KEY, JSON.stringify(next));
    if (next.email) window.sessionStorage.setItem(TRAINING_EMAIL_STORAGE_KEY, next.email);
  } catch {
    // Kein Storage (privates Fenster o. ä.): dann wird eben neu gefragt.
  }
  try {
    if (mayRemember()) window.localStorage.setItem(REMEMBERED_PROFILE_KEY, JSON.stringify(next));
  } catch {
    // dito
  }
}

/** Nach jeder Consent-Wahl: erlaubt -> Tab-Angaben merken, sonst löschen. */
export function applyRememberConsent(allowed: boolean): void {
  try {
    if (!allowed) {
      window.localStorage.removeItem(REMEMBERED_PROFILE_KEY);
      return;
    }
    const session = readJson(window.sessionStorage, TRAINING_PROFILE_STORAGE_KEY);
    const email = window.sessionStorage.getItem(TRAINING_EMAIL_STORAGE_KEY);
    const merged = clean({
      ...readJson(window.localStorage, REMEMBERED_PROFILE_KEY),
      ...session,
      ...(email ? { email } : {}),
    });
    if (Object.keys(merged).length) {
      window.localStorage.setItem(REMEMBERED_PROFILE_KEY, JSON.stringify(merged));
    }
  } catch {
    // Storage blockiert
  }
}

/** Kalender nur für Nicht-Agenturen ab $1M Umsatz (Simon 23.11.). */
export function qualifiesForCalendar(profile: VisitorProfile): boolean {
  if (!profile.role || profile.role === "for-clients") return false;
  return Boolean(profile.revenue) && profile.revenue !== "Under $1M";
}

/** Video-Breakdown nicht für Agenturen unter $1M (Simon 23.11.). */
export function excludedFromVideo(profile: VisitorProfile): boolean {
  return profile.role === "for-clients" && profile.revenue === "Under $1M";
}
