"use client";

import Image from "next/image";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type TransitionEvent,
} from "react";
import { BeforeAfterScrubber } from "./before-after-scrubber";
import { SectionTag } from "./section-tag";
import styles from "./featured-work.module.css";

const SLIDE_COUNT = 3;

type TrackStyle = CSSProperties & { "--carousel-x": string };

function FeaturedSlide({ index, clone = false }: { index: number; clone?: boolean }) {
  return (
    <article
      className={styles.slide}
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${SLIDE_COUNT}`}
      aria-hidden={clone || undefined}
      data-clone={clone || undefined}
    >
      <div className={styles.slideMedia}>
        <BeforeAfterScrubber
          testId={`before-after-${index + 1}${clone ? "-clone" : ""}`}
          interactive={!clone}
        />
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
  const [physicalIndex, setPhysicalIndex] = useState(1);
  const [stepWidth, setStepWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number } | null>(null);

  const current = (physicalIndex - 1 + SLIDE_COUNT) % SLIDE_COUNT;
  const trackStyle: TrackStyle = {
    "--carousel-x": `${-(physicalIndex * stepWidth) + dragOffset}px`,
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const slides = track.querySelectorAll<HTMLElement>("article");
      if (slides.length < 2) return;
      setStepWidth(slides[1].offsetLeft - slides[0].offsetLeft);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    return () => resizeObserver.disconnect();
  }, []);

  const showPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPhysicalIndex((active) => active - 1);
  };

  const showNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPhysicalIndex((active) => active + 1);
  };

  const finishLoop = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;

    if (physicalIndex === 0) setPhysicalIndex(SLIDE_COUNT);
    if (physicalIndex === SLIDE_COUNT + 1) setPhysicalIndex(1);
    setIsAnimating(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX };
    setIsAnimating(false);
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDragOffset(event.clientX - drag.startX);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    const threshold = Math.min(stepWidth * 0.14, 120);
    dragRef.current = null;
    setIsDragging(false);

    if (Math.abs(distance) < 2) {
      setDragOffset(0);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setDragOffset(0);

    if (distance <= -threshold) setPhysicalIndex((active) => active + 1);
    if (distance >= threshold) setPhysicalIndex((active) => active - 1);
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
      <div
        className={styles.viewport}
        ref={viewportRef}
        id="featured-track"
        data-dragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div
          className={styles.track}
          ref={trackRef}
          style={trackStyle}
          data-animating={isAnimating}
          onTransitionEnd={finishLoop}
        >
          <FeaturedSlide index={SLIDE_COUNT - 1} clone />
          {Array.from({ length: SLIDE_COUNT }, (_, index) => (
            <FeaturedSlide index={index} key={index} />
          ))}
          <FeaturedSlide index={0} clone />
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
