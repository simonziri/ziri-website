"use client";

import { useEffect, useRef, useState } from "react";
import { AuditCalendar, type CalendarEvent } from "@/components/audit-calendar";
import { calendarPrefill } from "@/components/audit-offer-flow";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { readProfile, type VisitorProfile } from "@/lib/visitor-profile";
import { startWatchTracking } from "@/lib/watch-tracking";
import styles from "./client-player.module.css";

/*
 * Player für persönliche Videos auf /v/<id> (Simon 25.11.).
 *
 * - Browser-Steuerung, Kapitel horizontal unter dem Video (Klick springt hin).
 * - "Copy link": kopiert den Link mit utm_source=shared, damit weitergeleitete
 *   Aufrufe im Dashboard als "shared" erscheinen. Der Klick wird gemessen.
 * - Am Ende: Audit-Hinweis im Video, außer das Profil sagt schon "nicht
 *   qualifiziert" (gleiche Regel wie im Anmelde-Flow, lib/visitor-profile).
 * - Darunter: Audit-Pitch mit sichtbarem Kalender. Wer laut Profil nicht
 *   qualifiziert ist (Agentur oder unter $1M), sieht weder Hinweis noch
 *   Kalender, nur das Video.
 * - Messung: lib/watch-tracking.ts, Slug "v-<id>". Gemessen werden auch
 *   "copy-link", "end-audit", "time-picked" (Uhrzeit gewählt) und "booked".
 *   Änderungen: Privacy Policy Abschnitt 6a mitziehen.
 */

const AUDIT_ID = "audit";
/** Sekunden vor Schluss, ab denen der Hinweis einblendet */
const END_LEAD = 5;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Gleiche Regel wie qualifiesForCalendar, aber nur wenn die Antwort schon bekannt ist */
const knownUnqualified = (p: VisitorProfile) =>
  p.role === "for-clients" || p.revenue === "Under $1M";

export function ClientPlayer({
  slug,
  src,
  poster,
  title,
  chapters,
}: {
  slug: string;
  src: string;
  poster?: string;
  title: string;
  chapters: readonly (readonly [number, string])[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tracker = useRef<ReturnType<typeof startWatchTracking> | null>(null);
  const [time, setTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const [dur, setDur] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<VisitorProfile | null>(null);

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const t = startWatchTracking(el, slug);
    tracker.current = t;
    const onTime = () => setTime(el.currentTime);
    const onMeta = () => setDur(Number.isFinite(el.duration) ? el.duration : null);
    onMeta();
    const onEnded = () => setEnded(true);
    const onPlay = () => setEnded(false);
    // Zurückspulen nach dem Ende blendet den Hinweis wieder aus
    const onSeeked = () => {
      setEnded(el.ended);
      setTime(el.currentTime);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("seeked", onSeeked);
    return () => {
      t.stop();
      tracker.current = null;
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("seeked", onSeeked);
    };
  }, [slug]);

  const mark = (name: string) => tracker.current?.mark(name);
  const onCalendar = (name: CalendarEvent) => {
    if (name !== "shown") mark(name);
  };

  const seek = (t: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = t;
    el.play().catch(() => {});
  };

  const copyLink = async () => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("utm_source", "shared");
    mark("copy-link");
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // Ältere Browser / ohne Clipboard-Recht: über ein verstecktes Textfeld
      const ta = document.createElement("textarea");
      ta.value = url.toString();
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // nichts mehr zu tun
      }
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const toAudit = () => {
    mark("end-audit");
    document.getElementById(AUDIT_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const active = chapters.reduce((acc, [t], i) => (time >= t ? i : acc), 0);
  const unqualified = profile ? knownUnqualified(profile) : false;
  // Hinweis blendet in den letzten 5 Sekunden ein (Simon 25.11.) und bleibt nach dem Ende
  const showEnd = ended || (dur !== null && time >= dur - END_LEAD);

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        <video
          ref={videoRef}
          className={styles.video}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
        />
        <div
          className={`${styles.endCard} ${showEnd ? styles.on : ""}`}
          data-theme="dark-primary"
          aria-hidden={!showEnd}
          inert={!showEnd}
        >
            <p className={styles.eyebrow}>Thanks for watching</p>
            {unqualified ? (
              <h3>Questions about any of this? Just reply to my email.</h3>
            ) : (
              <>
                <h3>Want me to look at the rest of your site?</h3>
                <p>A free audit, walked through with you on a short call.</p>
              </>
            )}
            <div className={styles.endActions}>
              {!unqualified && (
                <PixelHatchButton variant="secondary" onClick={toAudit}>
                  Pick a time
                </PixelHatchButton>
              )}
              <button type="button" className={styles.ghost} onClick={() => seek(0)}>
                Watch again
              </button>
            </div>
        </div>
      </div>

      <div className={styles.bar}>
        {chapters.length > 0 && (
          <nav className={styles.chapters} aria-label="Chapters">
            {chapters.map(([t, name], i) => {
              const end = chapters[i + 1]?.[0] ?? dur ?? t;
              const fill = i < active ? 1 : i === active && end > t ? Math.min(1, (time - t) / (end - t)) : 0;
              return (
                <button
                  key={t}
                  type="button"
                  className={styles.chapter}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => seek(t)}
                >
                  <span className={styles.chTime}>{fmt(t)}</span>
                  <span className={styles.chName}>{name}</span>
                  <span className={styles.chFill} style={{ transform: `scaleX(${fill})` }} aria-hidden="true" />
                </button>
              );
            })}
          </nav>
        )}
        <button type="button" className={styles.copy} onClick={copyLink} aria-live="polite">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M8.5 11.5a3.5 3.5 0 005 0l2.5-2.5a3.5 3.5 0 00-5-5l-1 1M11.5 8.5a3.5 3.5 0 00-5 0L4 11a3.5 3.5 0 005 5l1-1" />
          </svg>
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>

      {profile && !unqualified && (
      <section id={AUDIT_ID} className={styles.audit} aria-labelledby="audit-title" data-theme="dark-primary">
        <div className={styles.auditPitch}>
          <p className={styles.eyebrow}>Free audit</p>
          <h2 id="audit-title">Want me to look at the rest of your site?</h2>
          <p>A plan for your site, walked through with you on a short call:</p>
          <ul>
            <li>Where your site loses buyers, and which people in the buying group it doesn&rsquo;t speak to</li>
            <li>What your competitors say that you don&rsquo;t, and where you all sound the same</li>
            <li>Clear next steps, lowest effort and highest impact first</li>
          </ul>
          <p className={styles.auditNote}>
            None of the times work? Just reply to my email. Calendar by Cal.com, see our{" "}
            <a href="/privacy">privacy policy</a>.
          </p>
        </div>
        <div className={styles.auditCal} data-theme="light-primary">
          <AuditCalendar prefill={calendarPrefill(profile)} onEvent={onCalendar} />
        </div>
      </section>
      )}
    </div>
  );
}
