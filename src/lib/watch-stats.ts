import type { WatchSession } from "@/lib/watch-store";

/* Auswertung der Watch-Sessions für /watch-stats (reine Rechnung, kein I/O). */

export const BUCKET = 10;
/** Ab so viel Zuschauen zählt ein Seitenaufruf als Zuschauer */
export const MIN_WATCH = 30;
/** Klicks, die als "Angebot geklickt" zählen (Rest: Link kopiert, Kalender) */
const OFFER_CLICKS = new Set(["audit", "book-call", "end-audit"]);

export type SessionRow = {
  sid: string;
  startedAt: string;
  email?: string;
  source?: string;
  watched: number;
  furthest: number;
  reachedPitch: boolean;
  finished: boolean;
  ctas: [string, number][];
  /** Uhrzeit im Kalender gewählt, aber nicht gebucht */
  pickedNoBook: boolean;
};

export type WatchStats = {
  dur: number;
  pitchStart: number;
  pageViews: number;
  viewers: number;
  identified: number;
  medianWatched: number;
  reachedPitch: number;
  finished: number;
  ctaClicks: number;
  copiedLink: number;
  pickedNoBook: number;
  booked: number;
  /** pro 10-s-Stück: Anteil der Zuschauer, die es gesehen haben (0–1) */
  retention: number[];
  /** pro 10-s-Stück: zusätzliche Abspielungen je Zuschauer, der es gesehen hat */
  rewatch: number[];
  chapters: { t: number; name: string; reached: number }[];
  rows: SessionRow[];
};

const union = (segs: [number, number][]) => {
  const sorted = [...segs].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const [a, b] of sorted) {
    const lastSeg = out[out.length - 1];
    if (lastSeg && a <= lastSeg[1]) lastSeg[1] = Math.max(lastSeg[1], b);
    else out.push([a, b]);
  }
  return out;
};

const overlap = (a: number, b: number, s: number, e: number) => Math.max(0, Math.min(b, e) - Math.max(a, s));

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function computeStats(
  sessions: WatchSession[],
  chapters: readonly (readonly [number, string])[],
): WatchStats {
  const dur = Math.max(1, ...sessions.map((s) => s.dur));
  const pitchStart = chapters.length ? chapters[chapters.length - 1][0] : dur;
  const nb = Math.ceil(dur / BUCKET);
  const seen = new Array<number>(nb).fill(0);
  const extra = new Array<number>(nb).fill(0);
  const rows: SessionRow[] = [];
  const reachedChapter = chapters.map(() => 0);

  for (const s of sessions) {
    const merged = union(s.segs);
    const watched = merged.reduce((sum, [a, b]) => sum + (b - a), 0);
    if (watched < MIN_WATCH && !s.ctas.length) continue;
    const has = (n: string) => s.ctas.some(([c]) => c === n);
    const furthest = merged.length ? merged[merged.length - 1][1] : 0;
    const sawAt = (t: number, need = 3) =>
      merged.some(([a, b]) => overlap(a, b, t, t + BUCKET) >= need);

    for (let i = 0; i < nb; i++) {
      const from = i * BUCKET;
      const to = from + BUCKET;
      if (!merged.some(([a, b]) => overlap(a, b, from, to) >= 1)) continue;
      seen[i]++;
      const plays = s.segs.filter(([a, b]) => overlap(a, b, from, to) >= 3).length;
      extra[i] += Math.max(0, plays - 1);
    }
    chapters.forEach(([t], i) => {
      if (sawAt(t + 5)) reachedChapter[i]++;
    });

    rows.push({
      sid: s.sid,
      startedAt: s.startedAt,
      email: s.email,
      source: s.source,
      watched,
      furthest,
      reachedPitch: sawAt(pitchStart + 5),
      finished: sawAt(Math.max(0, dur - 40)),
      ctas: s.ctas,
      pickedNoBook: has("time-picked") && !has("booked"),
    });
  }

  const viewers = rows.length;
  rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return {
    dur,
    pitchStart,
    pageViews: sessions.length,
    viewers,
    identified: rows.filter((r) => r.email).length,
    medianWatched: median(rows.map((r) => r.watched)),
    reachedPitch: rows.filter((r) => r.reachedPitch).length,
    finished: rows.filter((r) => r.finished).length,
    ctaClicks: rows.filter((r) => r.ctas.some(([c]) => OFFER_CLICKS.has(c))).length,
    copiedLink: rows.filter((r) => r.ctas.some(([c]) => c === "copy-link")).length,
    pickedNoBook: rows.filter((r) => r.pickedNoBook).length,
    booked: rows.filter((r) => r.ctas.some(([c]) => c === "booked")).length,
    retention: seen.map((n) => (viewers ? n / viewers : 0)),
    rewatch: extra.map((n, i) => (seen[i] ? n / seen[i] : 0)),
    chapters: chapters.map(([t, name], i) => ({
      t,
      name,
      reached: viewers ? reachedChapter[i] / viewers : 0,
    })),
    rows,
  };
}
