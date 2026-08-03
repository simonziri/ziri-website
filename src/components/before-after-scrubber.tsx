"use client";

import Image from "next/image";
import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import styles from "./featured-work.module.css";

type ScrubberStyle = CSSProperties & { "--position": string };

export function BeforeAfterScrubber({
  testId,
  interactive = true,
}: {
  testId: string;
  interactive?: boolean;
}) {
  const [position, setPosition] = useState(22);
  const scrubberStyle: ScrubberStyle = { "--position": `${position}%` };

  const updateFromPointer = (event: PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextPosition = ((event.clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.round(Math.min(100, Math.max(0, nextPosition))));
  };

  const handlePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLInputElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateFromPointer(event);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setPosition((value) => Math.max(0, value - 1));
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setPosition((value) => Math.min(100, value + 1));
    }
    if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div className={styles.scrubber} style={scrubberStyle}>
      <Image
        className={styles.afterImage}
        src="/assets/featured/circula-after.png"
        alt="Circula website after the ZIRI redesign"
        fill
        sizes="(max-width: 768px) calc(100vw - 64px), 353px"
      />
      <div className={styles.beforeLayer} aria-hidden="true">
        <Image
          className={styles.beforeImage}
          src="/assets/featured/circula-before.png"
          alt=""
          fill
          sizes="(max-width: 768px) calc(100vw - 64px), 353px"
        />
      </div>
      <span className={styles.beforeLabel} aria-hidden="true">
        Before
      </span>
      <span className={styles.afterLabel} aria-hidden="true">
        After
      </span>
      <span className={styles.scrubberDivider} aria-hidden="true" />
      <input
        className={styles.scrubberInput}
        data-testid={testId}
        type="range"
        min="0"
        max="100"
        value={position}
        tabIndex={interactive ? 0 : -1}
        aria-label="Compare the website before and after the redesign"
        onChange={(event) => setPosition(Number(event.currentTarget.value))}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />
    </div>
  );
}
