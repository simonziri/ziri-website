/*
 * Consent-Konfiguration + Speicherung (eigene Lösung, kein Third-Party-CMP).
 *
 * - Gespeichert wird NUR die Wahl selbst, in localStorage unter
 *   CONSENT_STORAGE_KEY ({ version, timestamp, choices }). Kein Cookie,
 *   keine Übertragung an einen Server.
 * - Neue Kategorie: einen Eintrag in CONSENT_CATEGORIES ergänzen UND
 *   CONSENT_VERSION hochzählen, damit alle Besucher neu gefragt werden
 *   (Version 2 = Marketing/Meta Pixel dazu).
 *   Datenschutzerklärung im selben Change anpassen (siehe CLAUDE.md).
 * - Jeder Storage-Zugriff ist in try/catch (Private Mode, blockierter
 *   Storage): dann gilt "keine Wahl getroffen" und es lädt nichts.
 */

export type ConsentCategoryId = "necessary" | "statistics" | "marketing";

export type ConsentCategory = {
  id: ConsentCategoryId;
  label: string;
  description: string;
  /** Immer an, nicht abwählbar. */
  required?: boolean;
};

export const CONSENT_CATEGORIES: ReadonlyArray<ConsentCategory> = [
  {
    id: "necessary",
    label: "Necessary",
    description:
      "Stores only your consent choice in your browser. No cookie, nothing is sent to us.",
    required: true,
  },
  {
    id: "statistics",
    label: "Statistics",
    description:
      "Google Analytics 4 and Microsoft Clarity. Show us how visitors use the site (including anonymized session recordings and heatmaps) and which campaigns bring visitors and sign-ups. Set cookies and only run if you allow it.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Meta Pixel. Lets us measure which of our Meta ads bring sign-ups and show our ads to people who visited this site. Sets cookies and only runs if you allow it.",
  },
];

export const CONSENT_STORAGE_KEY = "ziri-consent-v1";
export const CONSENT_VERSION = 2;

/** Öffnet das Banner erneut (Footer-Link "Cookie settings"). */
export const CONSENT_OPEN_EVENT = "ziri:consent:open";
/** Wird nach jeder gespeicherten Wahl gefeuert (detail: ConsentChoices). */
export const CONSENT_CHANGED_EVENT = "ziri:consent:changed";

export type ConsentChoices = Partial<Record<ConsentCategoryId, boolean>>;

export type ConsentRecord = {
  version: number;
  timestamp: string;
  choices: ConsentChoices;
};

export function readConsent(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      parsed?.version !== CONSENT_VERSION ||
      typeof parsed.timestamp !== "string" ||
      typeof parsed.choices !== "object" ||
      parsed.choices === null
    ) {
      return null;
    }
    return parsed as ConsentRecord;
  } catch {
    return null;
  }
}

export function writeConsent(choices: ConsentChoices): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    choices: { ...choices, necessary: true },
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blockiert: Wahl gilt nur für diesen Seitenaufruf.
  }
  return record;
}

/** Alle optionalen Kategorien auf einen Wert setzen (Accept all / Reject all). */
export function allChoices(value: boolean): ConsentChoices {
  const choices: ConsentChoices = {};
  for (const category of CONSENT_CATEGORIES) {
    choices[category.id] = category.required ? true : value;
  }
  return choices;
}

export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
