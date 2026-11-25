import { NextResponse } from "next/server";
import { getTrainingVideo } from "@/data/training-videos";
import { readSession, saveSession, storageReady, type WatchSession } from "@/lib/watch-store";

/**
 * Pings vom Player auf /watch/<key> (lib/watch-tracking.ts): wie viel jemand
 * vom Training geschaut hat. Speichert pro Seitenaufruf eine Datei
 * (lib/watch-store.ts). Liest bewusst keine IP und keinen User-Agent aus.
 * Privacy Policy Abschnitt "Training videos" beschreibt das.
 */

const SID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EMAIL = /^[^\s@]{1,100}@[^\s@]{1,100}\.[^\s@]{2,30}$/;
const MAX_SEGS = 400;
const MAX_CTAS = 30;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 30_000) return new NextResponse(null, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const sid = typeof body.sid === "string" ? body.sid : "";
  const dur = num(body.dur);
  if (!getTrainingVideo(slug) || !SID.test(sid) || dur === null || dur <= 0 || dur > 6 * 3600) {
    return new NextResponse(null, { status: 400 });
  }
  if (!storageReady()) return new NextResponse(null, { status: 204 });

  const segs: [number, number][] = [];
  if (Array.isArray(body.segs)) {
    for (const s of body.segs.slice(0, MAX_SEGS)) {
      if (!Array.isArray(s)) continue;
      const a = num(s[0]);
      const b = num(s[1]);
      if (a === null || b === null || a < 0 || b <= a || b > dur + 5) continue;
      segs.push([Math.round(a * 10) / 10, Math.round(b * 10) / 10]);
    }
  }

  const ctas: [string, number][] = [];
  if (Array.isArray(body.ctas)) {
    for (const c of body.ctas.slice(0, MAX_CTAS)) {
      if (!Array.isArray(c) || typeof c[0] !== "string" || !/^[a-z-]{1,30}$/.test(c[0])) continue;
      const t = num(c[1]);
      if (t !== null && t >= 0 && t <= dur + 5) ctas.push([c[0], Math.round(t)]);
    }
  }

  const email =
    typeof body.email === "string" && EMAIL.test(body.email.trim())
      ? body.email.trim().toLowerCase()
      : undefined;
  const source =
    typeof body.source === "string" && /^[\w .:/|-]{1,120}$/.test(body.source)
      ? body.source
      : undefined;

  const now = new Date().toISOString();
  const previous = await readSession(slug, sid);
  const session: WatchSession = {
    slug,
    sid,
    dur: Math.round(dur * 10) / 10,
    segs,
    ctas,
    // Einmal bekannte E-Mail bleibt an der Session, auch wenn ein späterer Ping keine hat
    email: email ?? previous?.email,
    source: source ?? previous?.source,
    startedAt: previous?.startedAt ?? now,
    updatedAt: now,
  };

  try {
    await saveSession(session);
  } catch (error) {
    console.error("[watch] save failed", error instanceof Error ? error.message : "unknown");
    return new NextResponse(null, { status: 502 });
  }
  return new NextResponse(null, { status: 204 });
}
