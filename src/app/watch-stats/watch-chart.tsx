"use client";

import { useState, type PointerEvent } from "react";
import styles from "./watch-stats.module.css";

/* Zuschauer-Kurve + Wiederholungen, gemeinsame Zeitachse, Hover mit Fadenkreuz. */

const W = 1000;
const H = 260;
const RH = 90;
const PAD = { l: 44, r: 12, t: 16, b: 26 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function WatchChart({
  retention,
  rewatch,
  bucket,
  dur,
  pitchStart,
  chapters,
}: {
  retention: number[];
  rewatch: number[];
  bucket: number;
  dur: number;
  pitchStart: number;
  chapters: { t: number; name: string }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const x = (t: number) => PAD.l + (Math.min(t, dur) / dur) * IW;
  const y = (v: number) => PAD.t + (1 - v) * IH;
  const mid = (i: number) => Math.min(dur, i * bucket + bucket / 2);

  const line = retention.map((v, i) => `${i ? "L" : "M"}${x(mid(i)).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = retention.length
    ? `${line}L${x(mid(retention.length - 1)).toFixed(1)},${y(0)}L${x(mid(0)).toFixed(1)},${y(0)}Z`
    : "";
  const maxRe = Math.max(0.5, ...rewatch);
  const barW = Math.max(1, (bucket / dur) * IW - 2);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const t = ((px - PAD.l) / IW) * dur;
    if (t < 0 || t > dur) return setHover(null);
    setHover(Math.min(retention.length - 1, Math.floor(t / bucket)));
  };

  const chapterAt = (t: number) => {
    let name = "";
    for (const c of chapters) if (t >= c.t) name = c.name;
    return name;
  };

  const ticks: number[] = [];
  const step = dur > 1800 ? 300 : 120;
  for (let t = 0; t <= dur; t += step) ticks.push(t);

  return (
    <div className={styles.chartWrap}>
      <h3 className={styles.chartTitle}>Still watching (% of viewers)</h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Share of viewers still watching at each point of the video"
      >
        <rect x={x(pitchStart)} y={PAD.t} width={x(dur) - x(pitchStart)} height={IH} className={styles.pitchBand} />
        <text x={x(pitchStart) + 6} y={PAD.t + 14} className={styles.axisText}>Pitch</text>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className={styles.grid} />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" className={styles.axisText}>{Math.round(v * 100)}%</text>
          </g>
        ))}
        {chapters.slice(1).map((c, i) => (
          <g key={c.t}>
            <line x1={x(c.t)} x2={x(c.t)} y1={PAD.t} y2={y(0)} className={styles.chapterLine} />
            <text x={x(c.t) + 4} y={y(0) - 6} className={styles.axisText}>{i + 2}</text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - 6} textAnchor="middle" className={styles.axisText}>{fmt(t)}</text>
        ))}
        <path d={area} className={styles.area} />
        <path d={line} className={styles.line} />
        {hover !== null && (
          <g>
            <line x1={x(mid(hover))} x2={x(mid(hover))} y1={PAD.t} y2={y(0)} className={styles.crosshair} />
            <circle cx={x(mid(hover))} cy={y(retention[hover])} r={5} className={styles.dot} />
          </g>
        )}
      </svg>

      <h3 className={styles.chartTitle}>Rewatched (extra plays per viewer who saw that part)</h3>
      <svg
        viewBox={`0 0 ${W} ${RH}`}
        className={styles.chart}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Parts of the video people played more than once"
      >
        <line x1={PAD.l} x2={W - PAD.r} y1={RH - 8} y2={RH - 8} className={styles.grid} />
        {rewatch.map((v, i) =>
          v > 0 ? (
            <rect
              key={i}
              x={x(i * bucket) + 1}
              y={RH - 8 - (v / maxRe) * (RH - 20)}
              width={barW}
              height={(v / maxRe) * (RH - 20)}
              rx={2}
              className={hover === i ? styles.barActive : styles.bar}
            />
          ) : null,
        )}
        {hover !== null && (
          <line x1={x(mid(hover))} x2={x(mid(hover))} y1={4} y2={RH - 8} className={styles.crosshair} />
        )}
      </svg>

      <div className={styles.tooltip} aria-live="polite">
        {hover !== null ? (
          <>
            <strong>{fmt(hover * bucket)}–{fmt(Math.min(dur, (hover + 1) * bucket))}</strong>
            <span>{chapterAt(hover * bucket)}</span>
            <span>{Math.round(retention[hover] * 100)}% still watching</span>
            <span>{rewatch[hover].toFixed(2)} extra plays</span>
          </>
        ) : (
          <span>Hover the chart for details. Numbers on the curve = chapter starts.</span>
        )}
      </div>
    </div>
  );
}
