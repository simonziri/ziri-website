import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTrainingVideo } from "@/data/training-videos";
import { loadSessions, storageReady } from "@/lib/watch-store";
import { BUCKET, MIN_WATCH, computeStats } from "@/lib/watch-stats";
import { WatchChart } from "./watch-chart";
import styles from "./watch-stats.module.css";

/*
 * Interne Auswertung der Watch-Seiten (Simon 24.11.). Nicht verlinkt,
 * noindex, nur mit ?k=<WATCH_STATS_KEY>. Lokal ohne Key offen.
 * Daten: lib/watch-store.ts, Rechnung: lib/watch-stats.ts.
 */

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Watch stats",
  robots: { index: false, follow: false },
};

const DEFAULT_SLUG = "cro-for-high-ticket-b2b";

const mins = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;
const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : "–");
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function WatchStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string; v?: string }>;
}) {
  const { k, v } = await searchParams;
  const key = process.env.WATCH_STATS_KEY;
  if (process.env.VERCEL ? !key || k !== key : key && k !== key) notFound();

  const slug = v || DEFAULT_SLUG;
  const video = getTrainingVideo(slug);
  if (!video) notFound();

  const sessions = await loadSessions(slug);
  const s = computeStats(sessions, video.chapters);
  const chapterOf = (t: number) => {
    let i = 0;
    s.chapters.forEach((c, j) => {
      if (t >= c.t) i = j;
    });
    return i + 1;
  };

  return (
    <main className={styles.page} data-theme="light-primary">
      <header className={styles.head}>
        <p className={styles.kicker}>Internal · not linked anywhere</p>
        <h1>Watch stats: CRO training</h1>
        <p className={styles.note}>
          One row = one page view where the video was played for at least {MIN_WATCH} seconds
          (or an offer was clicked). Email only shows when the viewer allowed statistics.
          {!storageReady() && " Storage is not connected (WATCH_BLOB_READ_WRITE_TOKEN missing), so nothing is saved yet."}
        </p>
      </header>

      <section className={styles.tiles} aria-label="Totals">
        <Tile label="Viewers" value={String(s.viewers)} sub={`${s.pageViews} page views with play`} />
        <Tile label="Median watch time" value={mins(s.medianWatched)} sub={`of ${mins(s.dur)}`} />
        <Tile label="Reached the pitch" value={pct(s.reachedPitch, s.viewers)} sub={`${people(s.reachedPitch)} · starts ${mins(s.pitchStart)}`} />
        <Tile label="Watched to the end" value={pct(s.finished, s.viewers)} sub={people(s.finished)} />
        <Tile label="Clicked an offer" value={pct(s.ctaClicks, s.viewers)} sub={people(s.ctaClicks)} />
        <Tile label="Known by email" value={String(s.identified)} sub="allowed statistics" />
      </section>

      {s.viewers > 0 ? (
        <WatchChart
          retention={s.retention}
          rewatch={s.rewatch}
          bucket={BUCKET}
          dur={s.dur}
          pitchStart={s.pitchStart}
          chapters={s.chapters}
        />
      ) : (
        <p className={styles.empty}>No viewers yet.</p>
      )}

      <section aria-labelledby="ch-title">
        <h2 id="ch-title" className={styles.h2}>Chapters</h2>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Chapter</th><th>Starts</th><th>Reached by</th></tr>
          </thead>
          <tbody>
            {s.chapters.map((c, i) => (
              <tr key={c.t}>
                <td>{i + 1}</td>
                <td>{c.name}</td>
                <td>{mins(c.t)}</td>
                <td>{Math.round(c.reached * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="ppl-title">
        <h2 id="ppl-title" className={styles.h2}>Viewers</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>When (Berlin)</th><th>Who</th><th>Watched</th><th>Furthest</th>
              <th>Pitch</th><th>Offers clicked</th><th>Source</th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map((r) => (
              <tr key={r.sid}>
                <td>{when(r.startedAt)}</td>
                <td>{r.email ?? <span className={styles.muted}>anonymous</span>}</td>
                <td>{mins(r.watched)} ({pct(r.watched, s.dur)})</td>
                <td>{mins(r.furthest)} · ch. {chapterOf(r.furthest)}</td>
                <td>{r.finished ? "to the end" : r.reachedPitch ? "reached" : "–"}</td>
                <td>{r.ctas.length ? r.ctas.map(([n, t]) => `${n} @ ${mins(t)}`).join(", ") : "–"}</td>
                <td className={styles.muted}>{r.source ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className={styles.tile}>
      <p className={styles.tileLabel}>{label}</p>
      <p className={styles.tileValue}>{value}</p>
      <p className={styles.tileSub}>{sub}</p>
    </div>
  );
}
