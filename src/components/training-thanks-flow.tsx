"use client";

import { useRef, useState } from "react";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { TrainingLoomForm } from "@/components/training-loom-form";
import styles from "@/app/training/training.module.css";

/**
 * Thank-you-Seite als zwei Schritte nacheinander (Simons Ansage 03.11.):
 * 1. Kalender eintragen (ein großer Button, Rest klein). Erst nach einem
 *    Klick auf einen Kalender-Link (oder "Skip") erscheint
 * 2. optional der Loom-Review + leiser "Book a call".
 * Kein Tracking an den Klicks (sonst Privacy Policy + Consent nachziehen).
 */
export function TrainingThanksFlow({
  slug,
  releaseDate,
  senderEmail,
  calendar,
}: {
  slug: string;
  releaseDate: string;
  senderEmail: string;
  calendar: { google: string; outlook: string; ics: string };
}) {
  const [calendarDone, setCalendarDone] = useState(false);
  const stepTwoRef = useRef<HTMLDivElement>(null);

  const finishStepOne = () => {
    // Erst nach dem Klick umschalten: sonst ist der Kalender-Link schon aus dem
    // DOM, bevor der Browser ihn öffnet
    setTimeout(() => setCalendarDone(true), 0);
    // Danach zu Schritt 2, damit er auf Mobile nicht unter dem Fold liegt
    setTimeout(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      stepTwoRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <>
      {/* 1/3 war die Anmeldung, daher startet die Seite bei 2/3 */}
      <p className={styles.stepTag}>2/3</p>
      <h1 id="thanks-title">
        Almost done. Put {releaseDate} in your calendar.
      </h1>

      {calendarDone ? (
        <p className={styles.thanksNote}>
          A confirmation email is on its way from{" "}
          <strong>{senderEmail}</strong>. Add it to your contacts so the
          training doesn&rsquo;t end up in spam.
        </p>
      ) : (
        <>
          <div className={styles.calendarActions} onClickCapture={finishStepOne}>
            <PixelHatchButton
              href={calendar.google}
              external
              className={styles.calendarPrimary}
            >
              Add to Google Calendar
            </PixelHatchButton>
            <p className={styles.calendarAlternatives}>
              Or add to{" "}
              <a href={calendar.outlook} target="_blank" rel="noopener noreferrer">
                Outlook
              </a>{" "}
              &middot;{" "}
              <a href={calendar.ics} download>
                Apple / other calendar
              </a>
            </p>
          </div>
          <button
            type="button"
            className={styles.calendarSkip}
            onClick={finishStepOne}
          >
            Skip this step
          </button>
        </>
      )}

      {calendarDone ? (
        <div className={styles.stepTwo} ref={stepTwoRef}>
          <p className={styles.stepTag}>3/3 &middot; Optional</p>
          <div
            className={styles.loomCard}
            role="region"
            aria-labelledby="loom-title"
            data-theme="light-primary"
          >
            <h2 id="loom-title">Want us to look at one of your pages?</h2>
            <p>
              Send us one page and we record a short Loom of how we&rsquo;d
              review it for a client: what we&rsquo;d change first, and why. We
              do a few each week, for B2B teams.
            </p>
            <TrainingLoomForm slug={slug} />
          </div>

          <div className={styles.thanksHurry}>
            <div>
              <h2>Need help sooner?</h2>
              <p>
                If a relaunch or a big page change is already planned and the
                clock is running, skip the wait and talk to us directly.
              </p>
            </div>
            <PixelHatchButton href="/#contact" variant="secondary">
              Book a call
            </PixelHatchButton>
          </div>

          <p className={styles.thanksNote}>
            Or{" "}
            <a
              href="https://www.linkedin.com/in/simonziri/"
              target="_blank"
              rel="noopener noreferrer"
            >
              connect with Simon on LinkedIn
            </a>
            .
          </p>
        </div>
      ) : null}
    </>
  );
}
