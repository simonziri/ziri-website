"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  ...Array.from({ length: 5 }, (_, index) => cellKey(1, index + 4)),
  cellKey(2, 3), cellKey(2, 9), cellKey(3, 2), cellKey(3, 10),
  cellKey(4, 1), cellKey(4, 6), cellKey(4, 11), cellKey(5, 1),
  cellKey(5, 6), cellKey(5, 11), cellKey(6, 1), cellKey(6, 4),
  cellKey(6, 5), cellKey(6, 6), cellKey(6, 7), cellKey(6, 8),
  cellKey(6, 11), cellKey(7, 1), cellKey(7, 6), cellKey(7, 11),
  cellKey(8, 1), cellKey(8, 6), cellKey(8, 11), cellKey(9, 2),
  cellKey(9, 10), cellKey(10, 3), cellKey(10, 9),
  ...Array.from({ length: 5 }, (_, index) => cellKey(11, index + 4)),
]);

const iterationCells = new Set([
  cellKey(1, 11), cellKey(2, 11), cellKey(3, 11), cellKey(4, 11),
  cellKey(5, 9), cellKey(5, 11), cellKey(6, 9), cellKey(6, 11),
  cellKey(7, 7), cellKey(7, 9), cellKey(7, 11), cellKey(8, 7),
  cellKey(8, 9), cellKey(8, 11), cellKey(9, 5), cellKey(9, 7),
  cellKey(9, 9), cellKey(9, 11), cellKey(10, 3), cellKey(10, 5),
  cellKey(10, 7), cellKey(10, 9), cellKey(10, 11), cellKey(11, 1),
  cellKey(11, 3), cellKey(11, 5), cellKey(11, 7), cellKey(11, 9),
  cellKey(11, 11),
]);

const phases: Phase[] = [
  { number: "01", label: "Foundation", accent: "#fac167", cells: foundationCells },
  { number: "02", label: "Execution", accent: "#d69cd5", cells: executionCells },
  { number: "03", label: "Iteration", accent: "#ff765a", cells: iterationCells },
];

type PixelCellStyle = CSSProperties & {
  "--cell-color": string;
  "--cell-prev"?: string;
};

function cellColor(phase: Phase, key: string) {
  return phase.cells.has(key) ? phase.accent : "var(--surface-raised)";
}

function PixelPattern({ phase }: { phase: Phase }) {
  // Beim Phasenwechsel werden nur die Pixel animiert, deren Farbe sich
  // ändert: runterskalieren in der alten Farbe, hochskalieren in der neuen.
  const previousPhaseRef = useRef(phase);
  const previousPhase = previousPhaseRef.current;

  useEffect(() => {
    previousPhaseRef.current = phase;
  }, [phase]);

  return (
    <div className={styles.pattern} aria-hidden="true">
      {Array.from({ length: 169 }, (_, index) => {
        const row = Math.floor(index / 13);
        const column = index % 13;
        const key = cellKey(row, column);
        const color = cellColor(phase, key);
        const previousColor = cellColor(previousPhase, key);
        const swaps = previousPhase !== phase && color !== previousColor;
        const style: PixelCellStyle = {
          "--cell-color": color,
        };
        if (swaps) {
          style["--cell-prev"] = previousColor;
          // Diagonale Welle: Pixel tauschen zeitversetzt statt alle gleichzeitig.
          style.animationDelay = `${(row + column) * 14}ms`;
        }

        return (
          <i
            key={swaps ? `${index}-${phase.label}` : index}
            className={styles.patternCell}
            data-swap={swaps || undefined}
            style={style}
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
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveStep = () => {
      animationFrame = 0;
      const center = window.innerHeight / 2;
      let nextStep = 0;

      stepRefs.current.forEach((step, index) => {
        if (step && step.getBoundingClientRect().top <= center) nextStep = index;
      });

      setActiveStep((current) => (current === nextStep ? current : nextStep));
    };

    const requestUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveStep);
    };

    updateActiveStep();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    const resizeObserver = new ResizeObserver(requestUpdate);
    stepRefs.current.forEach((step) => {
      if (step) resizeObserver.observe(step);
    });

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      resizeObserver.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
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
            <PixelPattern phase={phases[activeStep]} />
          </div>
        </div>

        <div className={styles.steps}>
          {phases.map((phase, index) => (
            <article
              className={styles.step}
              key={phase.label}
              data-active={activeStep === index}
              data-step-index={index}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
            >
              <div className={styles.mobilePattern}>
                <PixelPattern phase={phase} />
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
