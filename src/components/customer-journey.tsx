"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./customer-journey.module.css";

type Phase = {
  number: string;
  label: string;
  accent: string;
  cells: ReadonlySet<string>;
};

const cellKey = (row: number, column: number) => `${row}:${column}`;

const foundationCells = new Set(
  [10, 11].flatMap((row) => Array.from({ length: 11 }, (_, column) => cellKey(row, column + 1))),
);

const executionCells = new Set([
  ...Array.from({ length: 6 }, (_, index) => cellKey(1, index + 4)),
  cellKey(2, 2), cellKey(2, 10), cellKey(3, 1), cellKey(3, 11),
  cellKey(4, 0), cellKey(4, 12), cellKey(5, 0), cellKey(5, 12),
  cellKey(6, 0), cellKey(6, 4), cellKey(6, 8), cellKey(6, 12),
  cellKey(7, 0), cellKey(7, 12), cellKey(8, 0), cellKey(8, 3),
  cellKey(8, 6), cellKey(8, 9), cellKey(8, 12), cellKey(9, 0),
  cellKey(9, 3), cellKey(9, 6), cellKey(9, 9), cellKey(9, 12),
  cellKey(10, 1), cellKey(10, 4), cellKey(10, 5), cellKey(10, 6),
  cellKey(10, 7), cellKey(10, 8), cellKey(10, 11), cellKey(11, 2),
  cellKey(11, 10), ...Array.from({ length: 6 }, (_, index) => cellKey(12, index + 4)),
]);

const iterationCells = new Set(
  [
    [1, 1],
    [3, 3],
    [5, 5],
    [7, 7],
    [9, 9],
    [11, 11],
  ].flatMap(([column, height]) =>
    Array.from({ length: height }, (_, index) => cellKey(12 - index, column)),
  ),
);

const phases: Phase[] = [
  { number: "01", label: "Foundation", accent: "#fac167", cells: foundationCells },
  { number: "02", label: "Execution", accent: "#d69cd5", cells: executionCells },
  { number: "03", label: "Iteration", accent: "#ff765a", cells: iterationCells },
];

function PixelPattern({ phase, active }: { phase: Phase; active: boolean }) {
  return (
    <div className={styles.pattern} data-active={active} aria-hidden="true">
      {Array.from({ length: 169 }, (_, index) => {
        const row = Math.floor(index / 13);
        const column = index % 13;
        const isAccent = phase.cells.has(cellKey(row, column));

        return (
          <i
            key={index}
            className={styles.patternCell}
            style={isAccent ? { backgroundColor: phase.accent } : undefined}
          />
        );
      })}
    </div>
  );
}

function PhaseTag({ phase }: { phase: Phase }) {
  return (
    <div className={styles.phaseTag}>
      <span style={{ backgroundColor: phase.accent }}>{phase.number}</span>
      <span>{phase.label}</span>
    </div>
  );
}

export function CustomerJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const triggerRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.step);
          if (Number.isFinite(index)) setActiveStep(index);
        });
      },
      { rootMargin: "-49.5% 0px -49.5% 0px", threshold: 0 },
    );

    const triggers = triggerRefs.current;
    triggers.forEach((trigger) => {
      if (trigger) observer.observe(trigger);
    });

    return () => {
      triggers.forEach((trigger) => {
        if (trigger) observer.unobserve(trigger);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <section className={styles.section} id="customer" aria-labelledby="customer-title">
      <h2 className={styles.title} id="customer-title">
        Differentiation and customer research first so that both your buyer and AI
        will love you.
      </h2>

      <div className={styles.workflow}>
        <div
          className={styles.visualColumn}
          role="img"
          aria-label={`Current phase: ${phases[activeStep].label}`}
        >
          <div className={styles.stickyVisual}>
            {phases.map((phase, index) => (
              <PixelPattern phase={phase} active={activeStep === index} key={phase.label} />
            ))}
          </div>
        </div>

        <div className={styles.steps}>
          {phases.map((phase, index) => (
            <article className={styles.step} key={phase.label} data-active={activeStep === index}>
              <span
                className={styles.trigger}
                data-step={index}
                ref={(node) => {
                  triggerRefs.current[index] = node;
                }}
                aria-hidden="true"
              />
              <div className={styles.mobilePattern}>
                <PixelPattern phase={phase} active />
              </div>
              <PhaseTag phase={phase} />
              <h3>
                We start by understanding how your customer thinks and acts.{" "}
                <span>Then we sharpen your positioning and find what makes you unique.</span>
              </h3>
              <p>
                Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate
                libero et velit interdum, ac aliquet odio mattis. Class aptent taciti
                sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Curabitur tempus urna at turpis condimentum lobortis. Ut commodo
                efficitur neque.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
