"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { BeforeAfterScrubber } from "./before-after-scrubber";
import { SectionTag } from "./section-tag";
import styles from "./featured-work.module.css";

const SLIDE_COUNT = 3;

function FeaturedSlide({ index }: { index: number }) {
  return (
    <article
      className={styles.slide}
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${SLIDE_COUNT}`}
    >
      <div className={styles.slideMedia}>
        <BeforeAfterScrubber testId={`before-after-${index + 1}`} />
      </div>
      <div className={styles.slideContent}>
        <Image
          src="/assets/featured/before-after-logo.svg"
          alt="Circula"
          width={116}
          height={22}
        />
        <div className={styles.slideCopy}>
          <h2>Website relaunch for Circula</h2>
          <p>
            We research your buyers, and test the message - then design the brand
            and site that converts.
          </p>
        </div>
      </div>
    </article>
  );
}

export function FeaturedWork() {
  const [current, setCurrent] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const activeSlide = viewport?.querySelectorAll<HTMLElement>("article")[current];
    if (!viewport || !activeSlide) return;

    viewport.scrollTo({
      left: activeSlide.offsetLeft - viewport.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [current]);

  const showPrevious = () => {
    setCurrent((active) => (active - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  };

  const showNext = () => {
    setCurrent((active) => (active + 1) % SLIDE_COUNT);
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <section
      className={styles.section}
      id="featured-work"
      aria-label="Featured Work"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyboard}
    >
      <div className={styles.contentRow}>
        <SectionTag>Featured Work</SectionTag>
      </div>
      <div className={styles.viewport} ref={viewportRef} id="featured-track">
        <div className={styles.track}>
          {Array.from({ length: SLIDE_COUNT }, (_, index) => (
            <FeaturedSlide index={index} key={index} />
          ))}
        </div>
      </div>
      <div className={styles.contentRow}>
        <div className={styles.controls}>
          <button
            className={styles.arrowButton}
            type="button"
            aria-label="Show previous featured project"
            aria-controls="featured-track"
            onClick={showPrevious}
          >
            <Image
              src="/assets/featured/carousel-previous.svg"
              alt=""
              width={43}
              height={43}
            />
          </button>
          <button
            className={styles.arrowButton}
            type="button"
            aria-label="Show next featured project"
            aria-controls="featured-track"
            onClick={showNext}
          >
            <Image
              src="/assets/featured/carousel-next.svg"
              alt=""
              width={43}
              height={43}
            />
          </button>
        </div>
      </div>
      <p className={styles.liveStatus} aria-live="polite" aria-atomic="true">
        Featured project {current + 1} of {SLIDE_COUNT}
      </p>
    </section>
  );
}
