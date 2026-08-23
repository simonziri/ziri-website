"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, DotGrid, Shader } from "shaders/react";
import styles from "./home-sections.module.css";

/** Ziel-Abstand zwischen den Punkten in px — unabhängig von der Canvas-Größe. */
const DOT_PITCH = 25;

/**
 * Ramp-style dot grid behind hero and featured work.
 *
 * - Two aligned DotGrids crossfade through a cursor-following circle
 *   mask (alpha / alphaInverted): normal dots outside, small dots
 *   inside — so the dots shrink where the mouse is.
 * - The cursor position is tracked manually and passed as a reactive
 *   prop (the library's own mouse driver received no events here).
 * - density is derived from the measured canvas size so the dot pitch
 *   stays constant no matter how tall the canvas is.
 * - The wrapper fades in over 1.5s on mount; a CSS mask fades the
 *   dots' opacity toward the top and bottom edges.
 */
export function HeroDots() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0.5, y: 0.3 });
  const [center, setCenter] = useState({ x: 0.5, y: 0.3 });
  const [density, setDensity] = useState(60);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Punktabstand konstant halten: density = längste Kante / Pitch
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const longest = Math.max(rect.width, rect.height);
      if (longest > 0) setDensity(Math.round(longest / DOT_PITCH));
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(wrap);

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      targetRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    // Weiches Nachziehen statt 1:1-Tracking
    const tick = () => {
      setCenter((current) => {
        const nx = current.x + (targetRef.current.x - current.x) * 0.1;
        const ny = current.y + (targetRef.current.y - current.y) * 0.1;
        if (
          Math.abs(nx - current.x) < 0.0004 &&
          Math.abs(ny - current.y) < 0.0004
        ) {
          return current;
        }
        return { x: nx, y: ny };
      });
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.heroDots} ref={wrapRef} aria-hidden="true">
      <Shader style={{ width: "100%", height: "100%" }}>
        {/* Unsichtbare Cursor-Zone */}
        <Circle
          id="heroDotsCursor"
          visible={false}
          color="#ffffff"
          radius={0.28}
          softness={0.45}
          center={center}
        />
        {/* Normale Dots — überall außer in der Cursor-Zone */}
        <DotGrid
          color="#c6c5bb"
          density={density}
          dotSize={0.11}
          maskSource="heroDotsCursor"
          maskType="alphaInverted"
        />
        {/* Kleine Dots — nur in der Cursor-Zone */}
        <DotGrid
          color="#c6c5bb"
          density={density}
          dotSize={0.04}
          maskSource="heroDotsCursor"
          maskType="alpha"
        />
      </Shader>
    </div>
  );
}
