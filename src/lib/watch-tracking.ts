import { readConsent } from "@/lib/consent";
import { readProfile } from "@/lib/visitor-profile";

/*
 * Zuschau-Messung auf /watch/<key> und /v/<id> (Simon 24./25.11.): welche Stellen des
 * Trainings abgespielt werden, ob jemand den Pitch erreicht, welche
 * Angebote geklickt werden. Auswertung: /watch-stats.
 *
 * Immer (ohne Einwilligung), weil anonym und ohne Endgerät-Zugriff:
 * - Session-ID nur im Arbeitsspeicher (crypto.randomUUID), kein Cookie,
 *   kein local-/sessionStorage, nichts wird gelesen. Neuer Seitenaufruf =
 *   neue Session. Der Server speichert keine IP (api/watch).
 * - Gesendet werden nur Abspiel-Stücke, Videolänge, Angebots-Klicks und
 *   utm_source/utm_campaign/utm_content aus der URL.
 *
 * Mit Personenbezug NUR mit Einwilligung "Statistics", die am oder nach
 * STATS_EMAIL_SINCE gegeben wurde (erst ab da nennt der Banner-Text das):
 * dann geht die E-Mail aus der Anmeldung mit (sofern der Browser sie hat).
 */

// 25.11.: Banner-Text nennt jetzt alle Video-Seiten (/watch + /v), daher ab diesem Tag
export const STATS_EMAIL_SINCE = "2026-11-25T00:00:00.000Z";

const PING_MS = 15_000;
/** Sprung über mehr als das (Videosekunden) = neues Stück, kein Weiterlaufen */
const JUMP = 3;
const MAX_SEGS = 400;

function allowedEmail(): string | undefined {
  const consent = readConsent();
  if (!consent?.choices.statistics || consent.timestamp < STATS_EMAIL_SINCE) return undefined;
  return readProfile().email || undefined;
}

function sourceFromUrl(): string | undefined {
  try {
    const q = new URLSearchParams(window.location.search);
    const parts = ["utm_source", "utm_campaign", "utm_content"]
      .map((k) => q.get(k)?.trim())
      .filter((v): v is string => Boolean(v));
    return parts.length ? parts.join(" | ").slice(0, 120) : undefined;
  } catch {
    return undefined;
  }
}

/** Seiten ohne Video (Thank-you-Seite, Simon 25.11.): nur Kalender-Klicks
 *  ("shown", "time-picked", "booked"). Gleiches Format wie eine Watch-Session
 *  (dur = Obergrenze, Zeit = Sekunden seit Seitenaufruf), gleiche Regeln:
 *  anonym, E-Mail nur mit Statistik-Einwilligung. */
export const CALENDAR_DUR = 3600;

export function calendarTracker(slug: string) {
  const sid = crypto.randomUUID();
  const source = sourceFromUrl();
  const t0 = performance.now();
  const events: [string, number][] = [];
  return (name: string) => {
    if (events.length >= 30) return;
    if (name === "shown" && events.some(([n]) => n === "shown")) return;
    events.push([name, Math.min(CALENDAR_DUR, Math.round((performance.now() - t0) / 1000))]);
    try {
      fetch("/api/watch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, sid, dur: CALENDAR_DUR, segs: [], ctas: events, email: allowedEmail(), source }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Messung darf nie stören
    }
  };
}

export function startWatchTracking(el: HTMLVideoElement, slug: string) {
  const sid = crypto.randomUUID();
  const source = sourceFromUrl();
  const segs: [number, number][] = [];
  const ctas: [string, number][] = [];
  let open: [number, number] | null = null;
  let last = -1;
  let dirty = false;
  let played = false;

  const close = () => {
    open = null;
    last = -1;
  };

  const sample = () => {
    if (el.paused || el.seeking) return;
    const t = el.currentTime;
    if (open && last >= 0 && t >= last && t - last <= JUMP) {
      open[1] = t;
    } else if (segs.length < MAX_SEGS) {
      open = [t, t];
      segs.push(open);
    } else {
      // Obergrenze erreicht: letztes Stück weiterführen, statt neue anzulegen
      open = segs[segs.length - 1];
      open[1] = Math.max(open[1], t);
    }
    last = t;
    dirty = true;
  };

  const send = (final = false) => {
    if (!played || !dirty) return;
    dirty = false;
    const dur = el.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    const body = JSON.stringify({
      slug,
      sid,
      dur,
      segs: segs.filter(([a, b]) => b - a >= 0.5),
      ctas,
      email: allowedEmail(),
      source,
    });
    try {
      if (final && navigator.sendBeacon) {
        navigator.sendBeacon("/api/watch", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/watch", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Messung darf den Player nie stören
    }
  };

  const onPlay = () => {
    played = true;
    close();
    sample();
  };
  const onPause = () => {
    sample();
    close();
    send();
  };
  const onSeeking = () => close();
  const onEnded = () => {
    sample();
    close();
    send();
  };
  const onHide = () => {
    if (document.visibilityState === "hidden") {
      sample();
      send(true);
    }
  };
  const onPageHide = () => {
    sample();
    send(true);
  };

  el.addEventListener("play", onPlay);
  el.addEventListener("timeupdate", sample);
  el.addEventListener("pause", onPause);
  el.addEventListener("seeking", onSeeking);
  el.addEventListener("ended", onEnded);
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onPageHide);
  const timer = window.setInterval(() => send(), PING_MS);

  return {
    /** Klick auf ein Angebot im Player merken (z. B. "audit", "book-call") */
    mark(name: string) {
      if (ctas.length < 30) ctas.push([name, el.currentTime]);
      dirty = true;
      played = true;
      send();
    },
    stop() {
      sample();
      send(true);
      window.clearInterval(timer);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("timeupdate", sample);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("seeking", onSeeking);
      el.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
    },
  };
}
