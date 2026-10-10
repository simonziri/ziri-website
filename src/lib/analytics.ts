/*
 * Google Tag Manager (GA4 läuft als Tag in GTM) mit Google Consent Mode v2,
 * BASIC-Modus.
 *
 * Container: GTM-59MBXRHB (nicht geheim; per NEXT_PUBLIC_GTM_ID
 * überschreibbar). GA4-Mess-ID, Tags und Trigger werden in GTM gepflegt,
 * nicht im Code. In GA4-Admin: Datenaufbewahrung 14 Monate, Google Signals
 * aus (so steht es in der Datenschutzerklärung).
 *
 * Basic Mode heißt: Vor der Einwilligung in "Statistics" wird gtm.js NICHT
 * geladen, kein Request an Google (auch das Laden von GTM selbst überträgt
 * die IP an Google und braucht daher Einwilligung). Erst loadGoogleAnalytics()
 * setzt die Consent-Defaults (alles denied), das Update analytics_storage =
 * granted und lädt danach den Container. Das noscript-iframe von GTM wird
 * bewusst nicht eingebaut (ohne JS gibt es keine Einwilligung).
 *
 * Events: trackEvent() pusht {event, ...params} in den dataLayer. In GTM
 * dafür einen Trigger "Benutzerdefiniertes Ereignis" (z. B. generate_lead)
 * und ein GA4-Event-Tag anlegen.
 *
 * Seitenaufrufe bei Client-Navigation: GA4 Enhanced Measurement ("Page
 * changes based on browser history events") zählt pushState selbst, daher
 * kein manueller page_view (sonst doppelt).
 *
 * Meta Pixel später: eigene Kategorie "Marketing" in consent.ts, dann hier
 * ad_storage/ad_user_data entsprechend updaten und Tag in GTM an Consent
 * koppeln.
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-59MBXRHB";

let loaded = false;
let granted = false;

export function isAnalyticsConfigured() {
  return /^GTM-[A-Z0-9]+$/i.test(GTM_ID);
}

export function isAnalyticsActive() {
  return loaded && granted && Array.isArray(window.dataLayer);
}

export function loadGoogleAnalytics() {
  if (!isAnalyticsConfigured()) return;
  granted = true;

  if (loaded && window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // Consent-Befehle erwarten das arguments-Objekt, kein Array
    window.dataLayer!.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("set", "ads_data_redaction", true);

  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  script.dataset.consent = "statistics";
  document.head.appendChild(script);

  loaded = true;
}

/** Widerruf: Consent auf denied, weitere Hits sperren, _ga*-Cookies löschen. */
export function revokeGoogleAnalytics() {
  granted = false;
  if (window.gtag) {
    // GA4-Tags in GTM respektieren analytics_storage und senden danach nichts mehr
    window.gtag("consent", "update", { analytics_storage: "denied" });
  }
  deleteGaCookies();
}

function deleteGaCookies() {
  try {
    const names = document.cookie
      .split(";")
      .map((part) => part.split("=")[0]?.trim())
      .filter((name): name is string => !!name && name.startsWith("_ga"));
    if (!names.length) return;

    // GA setzt Cookies auf die höchstmögliche Domain (.simonziri.com),
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
  // GTM-Trigger "Benutzerdefiniertes Ereignis" auf `name`; GA4-Tag sendet per Beacon
  window.dataLayer!.push({ event: name, ...params });
}
