/*
 * Google Tag Manager mit Google Consent Mode v2, BASIC-Modus.
 * In GTM laufen: GA4 + Microsoft Clarity (Kategorie "Statistics") und
 * Meta Pixel (Kategorie "Marketing").
 *
 * Container: GTM-59MBXRHB (nicht geheim; per NEXT_PUBLIC_GTM_ID
 * überschreibbar). Mess-IDs, Tags und Trigger werden in GTM gepflegt,
 * nicht im Code. In GA4-Admin: Datenaufbewahrung 14 Monate, Google Signals
 * aus (so steht es in der Datenschutzerklärung).
 *
 * Basic Mode heißt: Solange weder "Statistics" noch "Marketing" erteilt ist,
 * wird gtm.js NICHT geladen, kein Request an Google (auch das Laden von GTM
 * selbst überträgt die IP an Google und braucht daher Einwilligung). Erst
 * applyTrackingConsent() setzt die Consent-Defaults (alles denied), danach
 * das Update je Kategorie und lädt dann den Container:
 *   - analytics_storage                          = granted nur bei Statistics
 *   - ad_storage, ad_user_data, ad_personalization = granted nur bei Marketing
 * Das noscript-iframe von GTM wird bewusst nicht eingebaut (ohne JS gibt es
 * keine Einwilligung).
 *
 * WICHTIG für die GTM-Konfiguration: Da GTM jetzt auch mit nur einer der
 * beiden Kategorien lädt, braucht jedes Tag eine Consent-Prüfung
 * ("Zusätzliche Einwilligung erforderlich"):
 *   - GA4-Tags + Clarity-Tag: analytics_storage
 *   - Meta-Pixel-Tags (PageView, Lead auf qualified_lead = nur In-house-Anmeldungen): ad_storage
 * Sonst feuert z. B. GA4 bei nur "Marketing" cookieless Pings.
 *
 * Events:
 *   - trackEvent() pusht {event, ...params} in den dataLayer (Trigger
 *     "Benutzerdefiniertes Ereignis", z. B. generate_lead).
 *   - Bei jeder gesetzten/geänderten Wahl (auch beim Seitenaufruf mit
 *     gespeicherter Wahl) pusht applyTrackingConsent() das Event
 *     consent_update mit { statistics, marketing } (für GTM-Trigger).
 *
 * Seitenaufrufe bei Client-Navigation: GA4 Enhanced Measurement ("Page
 * changes based on browser history events") zählt pushState selbst, daher
 * kein manueller page_view (sonst doppelt).
 */

type Gtag = (...args: unknown[]) => void;
type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] };
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    clarity?: Clarity;
    fbq?: Fbq;
  }
}

export type TrackingConsent = { statistics: boolean; marketing: boolean };

/*
 * Microsoft Clarity wird als Tag in GTM geladen. Zusätzlich bekommt Clarity
 * das Consent-Signal über die Clarity Consent API v2 (für EEA-Traffic
 * Pflicht). Der Stub puffert die Aufrufe, bis das Clarity-Script aus GTM sie
 * abarbeitet.
 */
function clarity(...args: unknown[]) {
  if (typeof window.clarity !== "function") {
    const stub: Clarity = function (...queued: unknown[]) {
      (stub.q = stub.q || []).push(queued);
    };
    window.clarity = stub;
  }
  window.clarity!(...args);
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-59MBXRHB";

let loaded = false;
let current: TrackingConsent = { statistics: false, marketing: false };

export function isAnalyticsConfigured() {
  return /^GTM-[A-Z0-9]+$/i.test(GTM_ID);
}

/** GTM geladen und mindestens eine Tracking-Kategorie erteilt. */
export function isAnalyticsActive() {
  return (
    loaded && (current.statistics || current.marketing) && Array.isArray(window.dataLayer)
  );
}

function consentState({ statistics, marketing }: TrackingConsent) {
  const ad = marketing ? "granted" : "denied";
  return {
    analytics_storage: statistics ? "granted" : "denied",
    ad_storage: ad,
    ad_user_data: ad,
    ad_personalization: ad,
  };
}

/**
 * Zentrale Steuerung: bei jeder Wahl (Erstbesuch, gespeicherte Wahl,
 * späterer Widerruf) mit dem vollständigen Stand beider Kategorien aufrufen.
 * Jede Kategorie wird unabhängig erteilt bzw. widerrufen.
 */
export function applyTrackingConsent(next: TrackingConsent) {
  const previous = current;
  current = { statistics: !!next.statistics, marketing: !!next.marketing };
  const anyGranted = current.statistics || current.marketing;

  // Widerruf bzw. nicht erteilt: Cookies der Kategorie entfernen
  if (!current.statistics) revokeStatistics();
  if (!current.marketing) revokeMarketing(previous.marketing);

  if (!isAnalyticsConfigured()) return;

  if (current.statistics) {
    if (previous.statistics === false && typeof window.clarity === "function") {
      // Nach vorherigem consent(false) wieder freigeben
      clarity("consent");
    }
    clarity("consentv2", {
      analytics_Storage: "granted",
      ad_Storage: current.marketing ? "granted" : "denied",
    });
  }
  if (current.marketing && typeof window.fbq === "function") {
    // Pixel war schon da und wurde zuvor per revoke gestoppt
    window.fbq("consent", "grant");
  }

  if (loaded && window.gtag) {
    window.gtag("consent", "update", consentState(current));
    pushConsentEvent();
    return;
  }

  // Noch nichts geladen und nichts erteilt: kein Request, kein dataLayer
  if (!anyGranted) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // Consent-Befehle erwarten das arguments-Objekt, kein Array
    window.dataLayer!.push(arguments);
  };

  window.gtag("consent", "default", consentState({ statistics: false, marketing: false }));
  window.gtag("consent", "update", consentState(current));
  window.gtag("set", "ads_data_redaction", true);
  pushConsentEvent();

  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  script.dataset.consent = "statistics marketing";
  document.head.appendChild(script);

  loaded = true;
}

function pushConsentEvent() {
  window.dataLayer?.push({
    event: "consent_update",
    statistics: current.statistics,
    marketing: current.marketing,
  });
}

/** Statistics nicht (mehr) erteilt: Clarity stoppen, _ga*- und Clarity-Cookies löschen. */
function revokeStatistics() {
  // Auch vorsorglich, wenn GTM nur wegen Marketing lädt: der Stub puffert
  // das Signal, falls das Clarity-Tag in GTM trotzdem feuert.
  if (typeof window.clarity === "function" || current.marketing) {
    // Clarity stoppt und löscht seine Cookies (_clck, _clsk)
    clarity("consentv2", {
      analytics_Storage: "denied",
      ad_Storage: current.marketing ? "granted" : "denied",
    });
    clarity("consent", false);
  }
  deleteCookies(
    (name) => name.startsWith("_ga") || name === "_clck" || name === "_clsk",
  );
}

/** Marketing nicht (mehr) erteilt: Meta Pixel stoppen, _fbp/_fbc und First-Party-LinkedIn-Cookies löschen. */
function revokeMarketing(wasGranted: boolean) {
  if (wasGranted && typeof window.fbq === "function") {
    // Pixel zählt sonst Client-Navigationen (History-Events) weiter
    window.fbq("consent", "revoke");
  }
  deleteCookies(
    (name) =>
      name === "_fbp" ||
      name === "_fbc" ||
      name.startsWith("li_") ||
      name === "lms_ads" ||
      name === "lms_analytics",
  );
}

function deleteCookies(match: (name: string) => boolean) {
  try {
    const names = document.cookie
      .split(";")
      .map((part) => part.split("=")[0]?.trim())
      .filter((name): name is string => !!name && match(name));
    if (!names.length) return;

    // GA/Meta setzen Cookies auf die höchstmögliche Domain (.simonziri.com),
    // daher alle Domain-Stufen des Hostnamens durchprobieren.
    const parts = window.location.hostname.split(".");
    const domains: Array<string | null> = [null];
    for (let i = 0; i < parts.length - 1; i += 1) {
      const domain = parts.slice(i).join(".");
      domains.push(domain, `.${domain}`);
    }

    for (const name of names) {
      for (const domain of domains) {
        document.cookie =
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
          (domain ? `; domain=${domain}` : "");
      }
    }
  } catch {
    // Cookies nicht zugreifbar: nichts zu tun
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!isAnalyticsActive()) return;
  // GTM-Trigger "Benutzerdefiniertes Ereignis" auf `name`. Welche Tags
  // feuern (GA4, Meta Lead), entscheiden deren Consent-Prüfungen in GTM.
  window.dataLayer!.push({ event: name, ...params });
}
