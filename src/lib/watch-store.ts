import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { get, list, put } from "@vercel/blob";

/*
 * Speicher für Watch-Sessions (/watch-Seiten, Simon 24.11.).
 *
 * - Eine Datei pro Seitenaufruf mit Abspielen: watch/<slug>/<sid>.json.
 *   Jeder Ping überschreibt sie mit dem aktuellen Stand.
 * - Produktion: PRIVATER Vercel-Blob-Store, Token in WATCH_BLOB_READ_WRITE_TOKEN
 *   (bewusst nicht BLOB_READ_WRITE_TOKEN: das ist der öffentliche
 *   Video-Store). Ohne Token: lokale Dateien in .watch-data/ (nur Dev,
 *   gitignored). Auf Vercel ohne Token wird nichts gespeichert.
 * - Keine IP, kein User-Agent, kein Cookie. E-Mail nur, wenn der Browser
 *   sie mit Statistik-Einwilligung mitschickt (lib/watch-tracking.ts).
 *   Datenschutzerklärung Abschnitt "Training videos".
 */

export type WatchSession = {
  slug: string;
  sid: string;
  /** Videolänge in Sekunden */
  dur: number;
  /** Abgespielte Stücke [von, bis] in Sekunden, in Abspiel-Reihenfolge */
  segs: [number, number][];
  /** Klicks auf Angebote im Player: [Name, Videosekunde] */
  ctas: [string, number][];
  email?: string;
  source?: string;
  startedAt: string;
  updatedAt: string;
};

const token = process.env.WATCH_BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join(process.cwd(), ".watch-data");
const onVercel = Boolean(process.env.VERCEL);

const blobPath = (slug: string, sid: string) => `watch/${slug}/${sid}.json`;

export const storageReady = () => Boolean(token) || !onVercel;

export async function saveSession(session: WatchSession): Promise<void> {
  const body = JSON.stringify(session);
  if (token) {
    await put(blobPath(session.slug, session.sid), body, {
      access: "private",
      token,
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  if (onVercel) return;
  const dir = path.join(LOCAL_DIR, session.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${session.sid}.json`), body);
}

/** Vorhandenen Stand lesen, damit startedAt beim Überschreiben bleibt */
export async function readSession(slug: string, sid: string): Promise<WatchSession | null> {
  try {
    if (token) {
      const res = await get(blobPath(slug, sid), { access: "private", token, useCache: false });
      if (!res) return null;
      return JSON.parse(await new Response(res.stream).text()) as WatchSession;
    }
    if (onVercel) return null;
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, slug, `${sid}.json`), "utf8"));
  } catch {
    return null;
  }
}

export async function loadSessions(slug: string): Promise<WatchSession[]> {
  if (token) {
    const paths: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `watch/${slug}/`, token, cursor, limit: 1000 });
      paths.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    const out: WatchSession[] = [];
    for (let i = 0; i < paths.length; i += 25) {
      const batch = await Promise.all(
        paths.slice(i, i + 25).map(async (p) => {
          try {
            const res = await get(p, { access: "private", token });
            return res ? (JSON.parse(await new Response(res.stream).text()) as WatchSession) : null;
          } catch {
            return null;
          }
        }),
      );
      for (const s of batch) if (s) out.push(s);
    }
    return out;
  }
  if (onVercel) return [];
  try {
    const dir = path.join(LOCAL_DIR, slug);
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    return Promise.all(
      files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8")) as WatchSession),
    );
  } catch {
    return [];
  }
}
