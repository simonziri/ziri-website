"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { OfferDialog } from "@/components/offer-dialog";
import type { TrainingVideo } from "@/data/training-videos";
import styles from "./training-player.module.css";
import formStyles from "./book-call.module.css";

/*
 * Video-Player der /watch-Seite (Mockup: Lead Magnet/magnets/training-page-mockup).
 * - Eigenes <video>, kein iframe: die Endkarte ist eine Ebene über dem Video,
 *   Vollbild gilt für die ganze Player-Box, damit die Karte sichtbar bleibt.
 * - Endkarte (Variante E): `endCardLeadSeconds` vor Schluss, Video läuft
 *   weiter; nach dem Ende "Thanks for watching" + "Watch again".
 * - Player schmaler als 640 px (Handy): keine Karte im Video, stattdessen
 *   leuchten die Boxen unter dem Video auf (iPhone-Vollbild zeigt nur das
 *   nackte Video).
 * - Kein Tracking (sonst Consent + Privacy Policy nachziehen).
 */

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const COMPACT_WIDTH = 640;
/** Kontaktformular unten auf der Watch-Seite (BookCall, id="contact") */
const CONTACT_ID = "contact";

const fmt = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const lastIndexAtOrBefore = (
  items: readonly (readonly [number, string])[],
  t: number,
) => {
  for (let i = items.length - 1; i >= 0; i--) if (t >= items[i][0]) return i;
  return -1;
};

type Line = { t: number; s: string; chapter: number };

export function TrainingPlayer({
  video,
  slug,
  title,
}: {
  video: TrainingVideo;
  slug: string;
  title: string;
}) {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const chapters = useMemo(() => {
    const end = duration || Infinity;
    return video.chapters.map(([t, name], i) => ({
      t,
      name,
      end: i < video.chapters.length - 1 ? video.chapters[i + 1][0] : end,
    }));
  }, [video.chapters, duration]);

  const lines: Line[] = useMemo(
    () =>
      video.transcript.map(([t, s]) => ({
        t,
        s,
        chapter: lastIndexAtOrBefore(video.chapters, t),
      })),
    [video.transcript, video.chapters],
  );

  const chapterIndex = lastIndexAtOrBefore(video.chapters, time);
  const lineIndex = lastIndexAtOrBefore(video.transcript, time);
  const remaining = duration ? duration - time : Infinity;
  const endLive = !ended && remaining <= video.endCardLeadSeconds;
  const showEndCard = (ended || endLive) && !compact;
  const belowLive = compact && endLive;

  /* ---------- video events ---------- */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      setTime(el.currentTime);
      if (!el.paused) raf = requestAnimationFrame(tick);
    };
    const onMeta = () => setDuration(el.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
      setEnded(false);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      setTime(el.currentTime);
    };
    const onEnded = () => {
      setEnded(true);
      setTime(el.duration);
    };
    const onSeek = () => setTime(el.currentTime);
    const onProgress = () => {
      let end = 0;
      for (let i = 0; i < el.buffered.length; i++) {
        if (el.buffered.start(i) <= el.currentTime + 1) end = Math.max(end, el.buffered.end(i));
      }
      setBuffered(end);
    };
    if (el.readyState >= 1) onMeta();
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("seeked", onSeek);
    el.addEventListener("progress", onProgress);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("seeked", onSeek);
      el.removeEventListener("progress", onProgress);
    };
  }, []);

  /* ---------- size + fullscreen ---------- */
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setCompact(entry.contentRect.width < COMPACT_WIDTH),
    );
    ro.observe(el);
    const onFs = () => setFullscreen(document.fullscreenElement === el);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    if (!speedOpen) return;
    const close = () => setSpeedOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [speedOpen]);

  /* ---------- actions ---------- */
  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {});
  }, []);
  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) play();
    else el.pause();
  }, [play]);
  const seek = useCallback(
    (t: number) => {
      const el = videoRef.current;
      if (!el) return;
      const max = Math.max(0, (el.duration || duration) - 0.05);
      el.currentTime = Math.min(Math.max(0, t), max);
      setTime(el.currentTime);
      setEnded(false);
    },
    [duration],
  );
  const seekAndPlay = useCallback(
    (t: number) => {
      seek(t);
      play();
    },
    [seek, play],
  );

  const kick = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2600);
  };

  const toggleFullscreen = () => {
    const el = playerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (pseudoFs) setPseudoFs(false);
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => setPseudoFs(true));
    else setPseudoFs(true);
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const setRate = (s: number) => {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
    setSpeedOpen(false);
  };

  /** CTA-Buttons: Video pausieren, Vollbild verlassen, zum Formular auf
      derselben Seite springen (Loom-Box unter dem Video oder #contact unten) */
  const goTo = (id: string, block: ScrollLogicalPosition) => {
    videoRef.current?.pause();
    const jump = () => {
      const box = document.getElementById(id);
      if (!box) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      box.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
      box
        .querySelector<HTMLElement>("input:not([type='hidden']):not([tabindex='-1']), select, textarea")
        ?.focus({ preventScroll: true });
    };
    if (document.fullscreenElement) document.exitFullscreen().then(jump, jump);
    else {
      setPseudoFs(false);
      jump();
    }
  };

  const goToContact = () => goTo(CONTACT_ID, "start");

  /* Gratis-Audit / Video-Breakdown: eigenes Modal mit denselben Fragen (Simon 23.11.) */
  // Video-Breakdown hier raus (Simon 23.11.: zwei Angebote reichen, das Audit wird gefragt)
  const [offer, setOffer] = useState<"audit" | null>(null);
  const openOffer = (kind: "audit") => {
    videoRef.current?.pause();
    const show = () => setOffer(kind);
    if (document.fullscreenElement) document.exitFullscreen().then(show, show);
    else {
      setPseudoFs(false);
      show();
    }
  };
  const closeOffer = useCallback(() => setOffer(null), []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("input, a, [data-player-ignore-keys]")) return;
    const el = videoRef.current;
    if (!el) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      toggle();
    } else if (k === "arrowleft" || k === "j") {
      e.preventDefault();
      seek(el.currentTime - (k === "j" ? 10 : 5));
    } else if (k === "arrowright" || k === "l") {
      e.preventDefault();
      seek(el.currentTime + (k === "l" ? 10 : 5));
    } else if (k === "f") toggleFullscreen();
    else if (k === "c") setCaptions((c) => !c);
    else if (k === "m") toggleMute();
    else if (k === "escape" && pseudoFs) setPseudoFs(false);
    kick();
  };

  /* ---------- scrubber ---------- */
  const timeAt = (clientX: number) => {
    const r = scrubRef.current?.getBoundingClientRect();
    if (!r || !duration) return 0;
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * duration;
  };
  const onScrubMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = scrubRef.current?.getBoundingClientRect();
    if (!r) return;
    setHover({ x: e.clientX - r.left, t: timeAt(e.clientX) });
    if (dragging) seek(timeAt(e.clientX));
  };
  const onScrubDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seek(timeAt(e.clientX));
  };
  const hoverChapter = hover ? lastIndexAtOrBefore(video.chapters, hover.t) : -1;

  const caption =
    captions && lineIndex >= 0 && !showEndCard
      ? (() => {
          const next = video.transcript[lineIndex + 1]?.[0] ?? duration;
          return time < next + 0.5 ? video.transcript[lineIndex][1] : null;
        })()
      : null;

  const playerClass = [
    styles.player,
    started && styles.started,
    playing && styles.playing,
    idle && playing && styles.idle,
    pseudoFs && styles.pseudoFs,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        ref={playerRef}
        className={playerClass}
        tabIndex={0}
        role="region"
        aria-label={`Training video: ${title}`}
        onKeyDown={onKeyDown}
        onMouseMove={kick}
        onTouchStart={kick}
      >
        <video
          ref={videoRef}
          className={styles.video}
          src={video.src}
          poster={video.poster}
          preload="metadata"
          playsInline
          onClick={toggle}
        />

        <button
          type="button"
          className={styles.bigPlay}
          onClick={play}
          aria-label="Play the training"
        >
          <span className={styles.disc}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15l12.5-7.5z" />
            </svg>
          </span>
          <span className={styles.bigPlayLabel}>Play the training</span>
        </button>

        <div className={styles.captions} aria-hidden="true">
          {caption ? <span>{caption}</span> : null}
        </div>

        <EndCard
          on={showEndCard}
          live={endLive}
          onAudit={() => openOffer("audit")}
          onBook={goToContact}
          onReplay={() => seekAndPlay(0)}
        />

        <div className={styles.controls}>
          <div
            ref={scrubRef}
            className={`${styles.scrub} ${dragging ? styles.dragging : ""}`}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            onPointerMove={onScrubMove}
            onPointerLeave={() => !dragging && setHover(null)}
            onPointerDown={onScrubDown}
            onPointerUp={() => setDragging(false)}
          >
            <div className={styles.track}>
              {chapters.map((c) => {
                const len = Math.max(0.001, (Number.isFinite(c.end) ? c.end : duration) - c.t);
                const pct = (v: number) => `${Math.min(1, Math.max(0, (v - c.t) / len)) * 100}%`;
                return (
                  <div key={c.t} className={styles.seg} style={{ flex: `${len} 0 0` }}>
                    <div className={styles.buf} style={{ width: pct(buffered) }} />
                    <div className={styles.fill} style={{ width: pct(time) }} />
                  </div>
                );
              })}
            </div>
            <div
              className={styles.knob}
              style={{ left: duration ? `${(time / duration) * 100}%` : 0 }}
            />
            {hover ? (
              <div className={styles.tip} style={{ left: hover.x }}>
                <b>{fmt(hover.t)}</b>
                <span>{hoverChapter >= 0 ? video.chapters[hoverChapter][1] : ""}</span>
              </div>
            ) : null}
          </div>

          <div className={styles.bar}>
            <button type="button" className={styles.cbtn} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={playing ? "M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" : "M7 4.5v15l12.5-7.5z"} />
              </svg>
            </button>
            <button type="button" className={`${styles.cbtn} ${styles.hideSm}`} onClick={() => seek(time - 10)} aria-label="Back 10 seconds">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 12a8 8 0 108-8H8M10.5 1.5L7.5 4l3 2.5" />
                <text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="monospace">10</text>
              </svg>
            </button>
            <button type="button" className={`${styles.cbtn} ${styles.hideSm}`} onClick={() => seek(time + 10)} aria-label="Forward 10 seconds">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M20 12a8 8 0 11-8-8h4M13.5 1.5l3 2.5-3 2.5" />
                <text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="monospace">10</text>
              </svg>
            </button>
            <button type="button" className={styles.cbtn} onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ opacity: muted ? 0.45 : 1 }}>
                <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
                <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
              </svg>
            </button>
            <span className={styles.time}>
              {fmt(time)} / {fmt(duration)}
            </span>
            <span className={styles.chapterNow}>
              {chapterIndex >= 0 ? `· ${video.chapters[chapterIndex][1]}` : ""}
            </span>
            <button
              type="button"
              className={`${styles.cbtn} ${styles.text}`}
              onClick={() => setCaptions((c) => !c)}
              aria-pressed={captions}
              aria-label="Captions"
            >
              CC
            </button>
            <div className={styles.menuWrap}>
              <button
                type="button"
                className={`${styles.cbtn} ${styles.text}`}
                aria-haspopup="menu"
                aria-expanded={speedOpen}
                aria-label="Playback speed"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeedOpen((o) => !o);
                }}
              >
                {speed}×
              </button>
              {speedOpen ? (
                <div className={styles.menu} role="menu">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="menuitemradio"
                      aria-checked={s === speed}
                      onClick={() => setRate(s)}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.cbtn}
              onClick={toggleFullscreen}
              aria-label={fullscreen || pseudoFs ? "Exit fullscreen" : "Fullscreen"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Unter dem Video: immer da */}
      <section className={styles.below} aria-label="Next steps">
        {/* Hauptangebot: Gratis-Audit, schwarz (Simon 23.11.), Text wie auf der Thank-you-Seite */}
        <div className={`${styles.cta} ${styles.ctaDark} ${belowLive ? styles.isLive : ""}`}>
          <LiveTag />
          <p className={styles.eyebrow}>Free audit</p>
          <h2>Want us to look at your site?</h2>
          <p>A plan for your site, walked through with you on a short call:</p>
          <ul className={styles.ctaList}>
            <li>Where your site loses buyers, and which people in the buying group it doesn&rsquo;t speak to</li>
            <li>What your competitors say that you don&rsquo;t, and where you all sound the same</li>
            <li>Clear next steps, lowest effort and highest impact first</li>
          </ul>
          <button type="button" className={formStyles.formSubmit} onClick={() => openOffer("audit")}>
            Get my free audit
          </button>
        </div>
        {/* Projekt mit uns: weiß, führt zum Kontaktformular unten */}
        <div className={`${styles.cta} ${belowLive ? styles.isLive : ""}`}>
          <LiveTag />
          <p className={styles.eyebrow}>Work with us</p>
          <h2>Want us to do this with you?</h2>
          <p>
            We talk to your customers and your sales team, look at your page
            and your messaging. You get the playbook: what you&rsquo;re doing
            now, why it isn&rsquo;t working, and what we&rsquo;d do instead.
          </p>
          <button
            type="button"
            className={`${formStyles.formSubmit} ${formStyles.formSubmitDark}`}
            onClick={goToContact}
          >
            Book a call
          </button>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.panel}>
          <h2>Chapters</h2>
          <ChapterList
            chapters={chapters}
            active={chapterIndex}
            time={time}
            onSeek={seekAndPlay}
          />
        </div>
        <div className={styles.panel}>
          <h2>Transcript</h2>
          <Transcript
            lines={lines}
            chapters={video.chapters}
            active={lineIndex}
            onSeek={seekAndPlay}
          />
        </div>
      </section>

      <OfferDialog slug={slug} variant="audit" open={offer === "audit"} onClose={closeOffer} />
    </>
  );
}

function LiveTag() {
  return (
    <span className={styles.liveTag} aria-hidden="true">
      <i />
      Simon&rsquo;s talking about this now
    </span>
  );
}

function EndCard({
  on,
  live,
  onAudit,
  onBook,
  onReplay,
}: {
  on: boolean;
  live: boolean;
  onAudit: () => void;
  onBook: () => void;
  onReplay: () => void;
}) {
  return (
    <div
      className={`${styles.endCard} ${on ? styles.on : ""} ${live ? styles.live : ""}`}
      aria-hidden={!on}
      data-player-ignore-keys={on ? undefined : true}
    >
      <div className={styles.endInner}>
        <p className={styles.eyebrow}>{live ? "What’s next" : "Thanks for watching"}</p>
        <h3>Two ways to take this further.</h3>
        <div className={styles.endGrid}>
          <div className={styles.vcard}>
            <p className={styles.eyebrow}>Free audit</p>
            <h4>We look at your site</h4>
            <p>
              A plan for your site, walked through with you on a short call:
              where it loses buyers, what competitors say that you don&rsquo;t,
              and clear next steps.
            </p>
            <div>
              <PixelHatchButton onClick={onAudit}>Get my free audit</PixelHatchButton>
            </div>
          </div>
          <div className={styles.vcard}>
            <p className={styles.eyebrow}>Work with us</p>
            <h4>We do this with you</h4>
            <p>
              We talk to your customers and sales team. You get the playbook:
              what you&rsquo;re doing now, why it isn&rsquo;t working, what
              we&rsquo;d do instead.
            </p>
            <div>
              <PixelHatchButton variant="secondary" onClick={onBook}>
                Book a call
              </PixelHatchButton>
            </div>
          </div>
        </div>
        {live ? null : (
          <button type="button" className={styles.replay} onClick={onReplay} tabIndex={on ? 0 : -1}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3.5 10a6.5 6.5 0 106.5-6.5H6M8 1L5.5 3.5 8 6" />
            </svg>
            Watch again
          </button>
        )}
      </div>
    </div>
  );
}

const ChapterList = memo(function ChapterList({
  chapters,
  active,
  time,
  onSeek,
}: {
  chapters: { t: number; name: string; end: number }[];
  active: number;
  time: number;
  onSeek: (t: number) => void;
}) {
  return (
    <ol className={styles.chapters}>
      {chapters.map((c, i) => (
        <li
          key={c.t}
          className={i === active ? styles.active : c.end <= time ? styles.done : undefined}
        >
          <button type="button" onClick={() => onSeek(c.t)}>
            <span className={styles.chapterTime}>{fmt(c.t)}</span>
            <span>{c.name}</span>
            <span className={styles.dot} />
          </button>
        </li>
      ))}
    </ol>
  );
});

function Transcript({
  lines,
  chapters,
  active,
  onSeek,
}: {
  lines: Line[];
  chapters: readonly (readonly [number, string])[];
  active: number;
  onSeek: (t: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [follow, setFollow] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !follow || q || active < 0 || box.matches(":hover")) return;
    const el = box.querySelector<HTMLElement>(`[data-line="${active}"]`);
    if (el) box.scrollTop = el.offsetTop - box.clientHeight * 0.35;
  }, [active, follow, q]);

  const hits = q ? lines.filter((l) => l.s.toLowerCase().includes(q)).length : 0;

  return (
    <>
      <div className={styles.trTools}>
        <label className={styles.search}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L18 18" />
          </svg>
          <input
            type="search"
            placeholder="Search the transcript"
            aria-label="Search the transcript"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {q ? <span className={styles.hits}>{hits} {hits === 1 ? "match" : "matches"}</span> : null}
        <label className={styles.toggle}>
          <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
          Follow along
        </label>
      </div>
      <TranscriptLines lines={lines} chapters={chapters} active={active} q={q} onSeek={onSeek} boxRef={boxRef} />
    </>
  );
}

const TranscriptLines = memo(function TranscriptLines({
  lines,
  chapters,
  active,
  q,
  onSeek,
  boxRef,
}: {
  lines: Line[];
  chapters: readonly (readonly [number, string])[];
  active: number;
  q: string;
  onSeek: (t: number) => void;
  boxRef: React.RefObject<HTMLDivElement | null>;
}) {
  const out: React.ReactNode[] = [];
  let lastChapter = -1;
  lines.forEach((l, i) => {
    const idx = q ? l.s.toLowerCase().indexOf(q) : -1;
    if (q && idx < 0) return;
    if (!q && l.chapter !== lastChapter && l.chapter >= 0) {
      lastChapter = l.chapter;
      out.push(
        <h3 key={`c${l.chapter}`}>
          <span className={styles.chapterTime}>{fmt(chapters[l.chapter][0])}</span>
          {chapters[l.chapter][1]}
        </h3>,
      );
    }
    out.push(
      <button
        key={i}
        type="button"
        data-line={i}
        className={`${styles.line} ${i === active ? styles.active : ""}`}
        onClick={() => onSeek(l.t)}
      >
        <span className={styles.chapterTime}>{fmt(l.t)}</span>
        <span>
          {q ? (
            <>
              {l.s.slice(0, idx)}
              <mark>{l.s.slice(idx, idx + q.length)}</mark>
              {l.s.slice(idx + q.length)}
            </>
          ) : (
            l.s
          )}
        </span>
      </button>,
    );
  });
  return (
    <div ref={boxRef} className={styles.transcript}>
      {out}
    </div>
  );
});
