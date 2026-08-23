"use client";

import { Circle, DotGrid, Shader } from "shaders/react";
import styles from "./home-sections.module.css";

/**
 * Ramp-style dot grid behind the hero.
 *
 * - DotGrid draws the field of small neutral dots.
 * - An invisible cursor-following Circle drives dotSize per pixel via
 *   map mode: dots shrink where the mouse is.
 * - An invisible Ellipse masks the grid so the dots lose opacity
 *   toward the top and bottom edges (opacity only, per feedback).
 */
export function HeroDots() {
  return (
    <div className={styles.heroDots} aria-hidden="true">
      <Shader style={{ width: "100%", height: "100%" }}>
        {/* Unsichtbare Cursor-Zone: weicher Kreis folgt der Maus */}
        <Circle
          id="heroDotsCursor"
          visible={false}
          color="#ffffff"
          radius={0.28}
          softness={0.45}
          center={{ type: "mouse-position", smoothing: 0.2, momentum: 0.2 }}
        />
        {/* Normale Dots — überall außer in der Cursor-Zone */}
        <DotGrid
          color="#c6c5bb"
          density={56}
          dotSize={0.22}
          maskSource="heroDotsCursor"
          maskType="alphaInverted"
        />
        {/* Kleine Dots — nur in der Cursor-Zone */}
        <DotGrid
          color="#c6c5bb"
          density={56}
          dotSize={0.08}
          maskSource="heroDotsCursor"
          maskType="alpha"
        />
      </Shader>
    </div>
  );
}
