/**
 * Lokaler Formular-Simulator (Simon 14.11.): mit ?simulate=1 in der URL
 * schicken die Trainings-Formulare nichts ab (kein beehiiv, Pipedrive, Mail),
 * sondern tun nur so. Nur im Dev-Server, in Production immer aus.
 */
export const SIMULATE_PARAM = "simulate";

export function isFormSimulation(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(SIMULATE_PARAM);
}

/** fetch-Ersatz: im Simulator kurze Pause und "ok", sonst echter Request. */
export function submitOrSimulate(url: string, init: RequestInit): Promise<Response> {
  if (isFormSimulation()) {
    console.info("[form-simulation]", url, init.body);
    return new Promise((resolve) =>
      setTimeout(() => resolve(new Response('{"ok":true}', { status: 200 })), 400),
    );
  }
  return fetch(url, init);
}
