/*
 * Google Analytics 4 mit Google Consent Mode v2, BASIC-Modus.
 *
 * Setup: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX in Vercel (Production)
 * setzen. Fehlt die Variable, passiert nichts (kein Script, keine Fehler).
 * In GA4-Admin: Datenaufbewahrung auf 14 Monate stellen, Google Signals aus
 * (so steht es in der Datenschutzerklärung).
 *
 * Basic Mode heißt: Vor der Einwilligung in "Statistics" existiert weder
 * gtag noch dataLayer, gtag.js wird nicht geladen, kein Request an Google.
 * Erst loadGoogleAnalytics() (nur nach Einwilligung aufgerufen) setzt die
 * Consent-Defaults, das Update auf granted und lädt gtag.js.
 *
 * Seitenaufrufe bei Client-Navigation (Next.js router.push/Link): GA4
 * Enhanced Measurement ("Page changes based on browser history events",
 * Standard an) zählt pushState/replaceState selbst. Deshalb senden wir
 * KEINEN manuellen page_view, sonst würde doppelt gezählt. Der erste
 * page_view kommt aus gtag('config'). Falls Enhanced Measurement im
 * GA4-Admin abgeschaltet wird, müsste hier ein page_view pro Route-Wechsel
 * ergänzt werden.
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

let loaded = false;
let granted = false;

export function isAnalyticsConfigured() {
  return /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);
}

export function isAnalyticsActive() {
  return loaded && granted && typeof window.gtag === "function";
}

export function loadGoogleAnalytics() {
  if (!isAnalyticsConfigured()) return;
  granted = true;

  // Nach einem Widerruf in derselben Sitzung wieder freigeben
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

  if (loaded && window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js erwartet das arguments-Objekt, kein Array
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
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  script.dataset.consent = "statistics";
  document.head.appendChild(script);

  loaded = true;
}

/** Widerruf: Consent auf denied, weitere Hits sperren, _ga*-Cookies löschen. */
export function revokeGoogleAnalytics() {
  granted = false;
  if (isAnalyticsConfigured()) {
    if (window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
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
  // transport_type beacon: Hit überlebt auch einen sofortigen Seitenwechsel
  window.gtag!("event", name, { ...params, transport_type: "beacon" });
}
