import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WATCH_SLUGS, getWatchVideo } from "@/data/client-videos";
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
  const video = getWatchVideo(slug);
  if (!video) notFound();

  const sessions = await loadSessions(slug);

  // Thank-you-Seite: nur Kalender-Klicks, kein Video (Simon 25.11.)
  if (video.kind === "calendar") {
    const rows = sessions
      .map((x) => {
        const has = (n: string) => x.ctas.some(([c]) => c === n);
        return { ...x, shown: has("shown"), picked: has("time-picked"), booked: has("booked") };
      })
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const shown = rows.filter((r) => r.shown).length;
    const picked = rows.filter((r) => r.picked).length;
    const booked = rows.filter((r) => r.booked).length;
    const pickedNoBook = rows.filter((r) => r.picked && !r.booked).length;
    return (
      <main className={styles.page} data-theme="light-primary">
        <header className={styles.head}>
          <p className={styles.kicker}>Internal · not linked anywhere</p>
          <h1>Watch stats: {video.label}</h1>
          <Switcher current={slug} k={k} />
          <p className={styles.note}>
            One row = one visit of the thank-you page where the booking calendar showed up
            (only people who qualify see it). Email only shows when the visitor allowed statistics.
          </p>
        </header>
        <section className={styles.tiles} aria-label="Totals">
          <Tile label="Saw the calendar" value={String(shown)} sub="visits" />
          <Tile label="Picked a time" value={pct(picked, shown)} sub={people(picked)} />
          <Tile label="Picked a time, didn't book" value={String(pickedNoBook)} sub={people(pickedNoBook)} />
          <Tile label="Booked" value={pct(booked, shown)} sub={people(booked)} />
        </section>
        <section aria-labelledby="cal-title">
          <h2 id="cal-title" className={styles.h2}>Visits</h2>
          {rows.length ? (
            <table className={styles.table}>
              <thead>
                <tr><th>When (Berlin)</th><th>Who</th><th>Picked a time</th><th>Booked</th><th>Source</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sid}>
                    <td>{when(r.startedAt)}</td>
                    <td>{r.email ?? <span className={styles.muted}>anonymous</span>}</td>
                    <td>{r.picked ? "yes" : "–"}</td>
                    <td>{r.booked ? "yes" : r.picked ? "no" : "–"}</td>
                    <td className={styles.muted}>{r.source ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.empty}>No visits yet.</p>
          )}
        </section>
      </main>
    );
  }

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
        <h1>Watch stats: {video.label}</h1>
        <Switcher current={slug} k={k} />
        <p className={styles.note}>
          One row = one page view where the video was played for at least {MIN_WATCH} seconds
          (or an offer was clicked). Email only shows when the viewer allowed statistics.
          {!storageReady() && " Storage is not connected (WATCH_BLOB_READ_WRITE_TOKEN missing), so nothing is saved yet."}
        </p>
      </header>

      <section className={styles.tiles} aria-label="Totals">
        <Tile label="Viewers" value={String(s.viewers)} sub={`${s.pageViews} page views with play`} />
        <Tile label="Median watch time" value={mins(s.medianWatched)} sub={`of ${mins(s.dur)}`} />
        {video.hasPitch && (
          <Tile label="Reached the pitch" value={pct(s.reachedPitch, s.viewers)} sub={`${people(s.reachedPitch)} · starts ${mins(s.pitchStart)}`} />
        )}
        <Tile label="Watched to the end" value={pct(s.finished, s.viewers)} sub={people(s.finished)} />
        <Tile label={video.hasPitch ? "Clicked an offer" : "Clicked “Pick a time”"} value={pct(s.ctaClicks, s.viewers)} sub={people(s.ctaClicks)} />
        <Tile label="Picked a time, didn't book" value={String(s.pickedNoBook)} sub={`${people(s.booked)} booked`} />
        <Tile label="Copied the link" value={String(s.copiedLink)} sub="shared views show as source “shared”" />
        <Tile label="Known by email" value={String(s.identified)} sub="allowed statistics" />
      </section>

      {s.viewers > 0 ? (
        <WatchChart
          retention={s.retention}
          rewatch={s.rewatch}
          bucket={BUCKET}
          dur={s.dur}
          pitchStart={video.hasPitch ? s.pitchStart : undefined}
          chapters={s.chapters}
        />
      ) : (
        <p className={styles.empty}>No viewers yet.</p>
      )}

      {s.chapters.length > 0 && (
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
      )}

      <section aria-labelledby="ppl-title">
        <h2 id="ppl-title" className={styles.h2}>Viewers</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>When (Berlin)</th><th>Who</th><th>Watched</th><th>Furthest</th>
              {video.hasPitch && <th>Pitch</th>}<th>Clicks</th><th>Source</th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map((r) => (
              <tr key={r.sid}>
                <td>{when(r.startedAt)}</td>
                <td>{r.email ?? <span className={styles.muted}>anonymous</span>}</td>
                <td>{mins(r.watched)} ({pct(r.watched, s.dur)})</td>
                <td>{mins(r.furthest)}{s.chapters.length > 0 && ` · ch. ${chapterOf(r.furthest)}`}</td>
                {video.hasPitch && <td>{r.finished ? "to the end" : r.reachedPitch ? "reached" : "–"}</td>}
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

function Switcher({ current, k }: { current: string; k?: string }) {
  return (
    <nav className={styles.switcher} aria-label="Pages">
      {WATCH_SLUGS.map((w) => (
        <Link
          key={w}
          href={`/watch-stats?${new URLSearchParams({ ...(k ? { k } : {}), v: w })}`}
          aria-current={w === current ? "page" : undefined}
        >
          {getWatchVideo(w)?.label ?? w}
        </Link>
      ))}
    </nav>
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
