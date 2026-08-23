"use client";

import { Circle, DotGrid, Ellipse, Shader } from "shaders/react";
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
        <Ellipse
          id="heroDotsFade"
          visible={false}
          color="#ffffff"
          center={{ x: 0.5, y: 0.5 }}
          radiusX={1.6}
          radiusY={0.42}
          softness={0.85}
        />
        <Circle
          id="heroDotsCursor"
          visible={false}
          color="#ffffff"
          radius={0.32}
          softness={1}
          center={{ type: "mouse-position", smoothing: 0.2, momentum: 0.2 }}
        />
        <DotGrid
          color="#d3d2c8"
          density={64}
          dotSize={{
            type: "map",
            source: "heroDotsCursor",
            channel: "luminance",
            inputMin: 0,
            inputMax: 1,
            outputMin: 0.2,
            outputMax: 0.05,
          }}
          maskSource="heroDotsFade"
        />
      </Shader>
    </div>
  );
}
