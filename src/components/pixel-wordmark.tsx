"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./site-footer.module.css";

const GLYPHS = {
  Z: [
    "11111111111", "11111111111", "11111111111", "00000011111",
    "00000111110", "00001111100", "00011111000", "00111110000",
    "00111100000", "01111000000", "11110000000", "11100000000",
    "11100000000", "11111111111", "11111111111", "11111111111",
  ],
  I: [
    "1111111", "1111111", "1111111", "0011100", "0011100", "0011100",
    "0011100", "0011100", "0011100", "0011100", "0011100", "0011100",
    "0011100", "1111111", "1111111", "1111111",
  ],
  R: [
    "11111111000", "11111111100", "11111111110", "11100001110",
    "11100000111", "11100000111", "11100001110", "11111111110",
    "11111111100", "11111111000", "11101110000", "11100111000",
    "11100011100", "11100011100", "11100001110", "11100000111",
  ],
} as const;

const TOP = ["#b0873c", "#a2564a", "#8b6ba6", "#c08949", "#9a5a50"];
const MID = ["#d8a44f", "#e0705a", "#b889c6", "#e19e52", "#c4685c"];
const BOT = ["#f5c86b", "#f2836b", "#dda5e6", "#f7b45e", "#ee7a6e"];
const HOT = ["#fff3c4", "#ffd08a", "#ffa98f", "#f3c9ff"];

type PixelStyle = CSSProperties & {
  "--pixel-color": string;
  "--pixel-hot": string;
  "--entry-delay": string;
};

type RuntimePixel = {
  box: HTMLElement;
  element: HTMLElement;
  x: number;
  y: number;
  heat: number;
  ux: number;
  uy: number;
};

const word = ["Z", "I", "R", "I"] as const;

export function PixelWordmark() {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    if (!mark) return;

    const pixels: RuntimePixel[] = Array.from(mark.querySelectorAll<HTMLElement>("[data-px]"))
      .map((box) => ({
        box,
        element: box.firstElementChild as HTMLElement,
        x: 0,
        y: 0,
        heat: 0,
        ux: 0,
        uy: 0,
      }));
    const active = new Set<RuntimePixel>();
    const entryTimers: number[] = [];
    let pointer: { x: number; y: number } | null = null;
    let animationFrame = 0;
    let inView = false;

    const measure = () => {
      const markBox = mark.getBoundingClientRect();
      pixels.forEach((pixel) => {
        const box = pixel.box.getBoundingClientRect();
        pixel.x = box.left - markBox.left + box.width / 2;
        pixel.y = box.top - markBox.top + box.height / 2;
      });
    };

    const reset = (pixel: RuntimePixel) => {
      pixel.element.style.setProperty("--pixel-scale", "1");
      pixel.element.style.setProperty("--pixel-brightness", "1");
      pixel.element.style.setProperty("--pixel-heat", "0");
      pixel.element.style.setProperty("--pixel-x", "0px");
      pixel.element.style.setProperty("--pixel-y", "0px");
    };

    const heat = (pixel: RuntimePixel, value: number, ux: number, uy: number) => {
      if (value <= pixel.heat) return;
      pixel.heat = value;
      pixel.ux = ux;
      pixel.uy = uy;
      active.add(pixel);
    };

    const frame = () => {
      const currentPointer = pointer;
      if (currentPointer) {
        pixels.forEach((pixel) => {
          const dx = pixel.x - currentPointer.x;
          const dy = pixel.y - currentPointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 165) return;
          const force = (1 - distance / 165) ** 1.5;
          heat(pixel, force, dx / (distance || 1), dy / (distance || 1));
        });
      }

      active.forEach((pixel) => {
        const value = pixel.heat;
        const push = value * 11;
        pixel.element.style.setProperty("--pixel-scale", (1 + value * 0.95).toFixed(3));
        pixel.element.style.setProperty(
          "--pixel-brightness",
          (1 + value * 0.75).toFixed(3),
        );
        pixel.element.style.setProperty("--pixel-heat", (value * 0.9).toFixed(3));
        pixel.element.style.setProperty("--pixel-x", `${pixel.ux * push}px`);
        pixel.element.style.setProperty("--pixel-y", `${pixel.uy * push}px`);
        pixel.heat *= 0.82;

        if (pixel.heat < 0.006) {
          pixel.heat = 0;
          reset(pixel);
          active.delete(pixel);
        }
      });

      if (active.size || pointer) animationFrame = window.requestAnimationFrame(frame);
      else animationFrame = 0;
    };

    const wake = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(frame);
    };

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const box = mark.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      wake();
    };

    const handlePointerLeave = () => {
      pointer = null;
      wake();
    };

    const handlePointerDown = () => {
      const currentPointer = pointer;
      if (!currentPointer) return;
      pixels.forEach((pixel, index) => {
        if (Math.hypot(pixel.x - currentPointer.x, pixel.y - currentPointer.y) > 165) return;
        const palette = [...MID, ...BOT];
        pixel.box.style.setProperty("--pixel-color", palette[(index * 7 + 3) % palette.length]);
        heat(pixel, 1, pixel.ux, pixel.uy);
      });
      wake();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (!entry.isIntersecting || mark.hasAttribute("data-visible")) return;
          mark.setAttribute("data-visible", "");
          pixels.forEach((pixel, index) => {
            const delay = Number(pixel.box.dataset.delay || index * 2);
            entryTimers.push(
              window.setTimeout(() => {
                heat(pixel, 0.55, 0, 0);
                wake();
              }, delay + 60),
            );
          });
        });
      },
      { threshold: 0.18 },
    );

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idleTimer = reducedMotion
      ? 0
      : window.setInterval(() => {
          if (!inView || pointer || !mark.hasAttribute("data-visible")) return;
          for (let index = 0; index < 3; index += 1) {
            const pixel = pixels[(Date.now() + index * 47) % pixels.length];
            heat(pixel, 0.28 + index * 0.08, 0, 0);
          }
          wake();
        }, 110);

    measure();
    observer.observe(mark);
    window.addEventListener("resize", measure, { passive: true });
    mark.addEventListener("pointermove", handlePointerMove, { passive: true });
    mark.addEventListener("pointerleave", handlePointerLeave);
    mark.addEventListener("pointerdown", handlePointerDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      mark.removeEventListener("pointermove", handlePointerMove);
      mark.removeEventListener("pointerleave", handlePointerLeave);
      mark.removeEventListener("pointerdown", handlePointerDown);
      entryTimers.forEach((timer) => window.clearTimeout(timer));
      if (idleTimer) window.clearInterval(idleTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  let pixelIndex = 0;

  return (
    <div className={styles.wordmark} ref={markRef} role="img" aria-label="ZIRI">
      {word.map((character, letterIndex) => {
        const rows = GLYPHS[character];
        const columns = rows[0].length;

        return (
          <div
            className={styles.letter}
            data-letter={`${character}${letterIndex}`}
            style={{ gridTemplateColumns: `repeat(${columns}, var(--footer-cell))` }}
            key={`${character}-${letterIndex}`}
          >
            {rows.flatMap((row, rowIndex) =>
              [...row].map((value, columnIndex) => {
                const key = `${rowIndex}-${columnIndex}`;
                if (value !== "1") return <span key={key} />;

                const palette = rowIndex / (rows.length - 1) < 0.34
                  ? TOP
                  : rowIndex / (rows.length - 1) < 0.58
                    ? MID
                    : BOT;
                const style: PixelStyle = {
                  "--pixel-color": palette[(pixelIndex * 7 + letterIndex * 3) % palette.length],
                  "--pixel-hot": HOT[(pixelIndex * 5 + rowIndex) % HOT.length],
                  "--entry-delay": `${(pixelIndex * 73 + rowIndex * 29) % 1000}ms`,
                };
                const delay = (pixelIndex * 73 + rowIndex * 29) % 1000;
                pixelIndex += 1;

                return (
                  <span data-px="" data-delay={delay} style={style} key={key}>
                    <i />
                  </span>
                );
              }),
            )}
          </div>
        );
      })}
    </div>
  );
}
