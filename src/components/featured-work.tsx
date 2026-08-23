"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type TransitionEvent,
} from "react";
import { SectionTag } from "./section-tag";
import styles from "./featured-work.module.css";

const slides = [
  {
    name: "Circula",
    slug: "circula",
    image: "/assets/featured/project-image-1.avif",
    logo: "/assets/tab-logos/Circula.svg",
    title: "Rebrand & Website Relaunch for Circula",
    body: "A complete redesign and 500+ page migration to help Circula look like the market leader.",
  },
  {
    name: "Simplesense",
    slug: "simplesense",
    image: "/assets/featured/project-image-2.avif",
    logo: "/assets/tab-logos/Simplesense.svg",
    title: "Brand and website relaunch for Simplesense",
    body: "A visual language built from their own story: systems that don't talk to each other, finally in one design.",
  },
  {
    name: "Leapsome",
    slug: "leapsome",
    image: "/assets/featured/leapsome-thumb.avif",
    logo: "/assets/tab-logos/Leapsome.svg",
    title: "Website System & Conversion Program for Leapsome",
    body: "From technical debt to a self-serve website the marketing team runs on its own.",
  },
  {
    name: "HockeyStack",
    slug: "hockeystack",
    image: "/assets/featured/hockeystack-thumb.avif",
    logo: "/assets/tab-logos/HockeyStack.svg",
    title: "Visual Refresh & Homepage Redesign for HockeyStack",
    body: "A sharper visual language and rebuilt homepage for the revenue analytics platform.",
  },
  {
    name: "Instaffo",
    slug: "instaffo",
    image: "/assets/featured/instaffo-thumb.avif",
    logo: "/assets/tab-logos/Instaffo.svg",
    title: "B2B Area Expansion for Instaffo",
    body: "We expanded Instaffo's B2B area, with a design system their team now runs.",
  },
] as const;

const SLIDE_COUNT = slides.length;

type TrackStyle = CSSProperties & { "--carousel-x": string };

function FeaturedSlide({ index, clone = false }: { index: number; clone?: boolean }) {
  const slide = slides[index];

  return (
    <article
      className={styles.slide}
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${SLIDE_COUNT}`}
      aria-hidden={clone || undefined}
      data-clone={clone || undefined}
      data-reveal={clone ? undefined : "rise"}
      style={
        clone
          ? undefined
          : ({ "--reveal-delay": `${400 + index * 140}ms` } as CSSProperties)
      }
    >
      <Link
        className={styles.slideLink}
        href={`/work/${slide.slug}`}
        scroll={false}
        tabIndex={clone ? -1 : undefined}
        draggable={false}
      >
        <div className={styles.slideMedia}>
          <div className={styles.projectImage}>
            <Image
              src={slide.image}
              alt={`${slide.name} website redesign`}
              fill
              draggable={false}
              sizes="(max-width: 768px) calc(100vw - 64px), 353px"
            />
            {/* Before/After-Labels vorerst raus (Simons Ansage 23.08.);
                Markup bei Bedarf wiederherstellen:
                <span className={styles.comparisonLabels}>Before/After</span> */}
          </div>
        </div>
        <div className={styles.slideContent}>
          <Image
            src={slide.logo}
            alt={slide.name}
            width={262}
            height={58}
            draggable={false}
          />
          <div className={styles.slideCopy}>
            <h2>{slide.title}</h2>
            <p>{slide.body}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function FeaturedWork() {
  const [physicalIndex, setPhysicalIndex] = useState<number>(SLIDE_COUNT);
  const [stepWidth, setStepWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    captured: boolean;
  } | null>(null);

  const current = physicalIndex % SLIDE_COUNT;
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

    if (physicalIndex === 1) setPhysicalIndex(SLIDE_COUNT + 1);
    if (physicalIndex === SLIDE_COUNT * 2) setPhysicalIndex(SLIDE_COUNT);
    setIsAnimating(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement) return;
    // Capture erst ab Bewegung (siehe handlePointerMove), damit Klicks
    // auf die Slide-Links normal navigieren.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      captured: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextOffset = event.clientX - drag.startX;

    if (!drag.captured) {
      if (Math.abs(nextOffset) < 8) return;
      drag.captured = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsAnimating(false);
      setIsDragging(true);
    }

    const limit = stepWidth || 1;
    setDragOffset(Math.max(-limit, Math.min(limit, nextOffset)));
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    if (!drag.captured) return;

    const distance = event.clientX - drag.startX;
    const threshold = Math.min(stepWidth * 0.14, 120);
    setIsDragging(false);
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
      <div
        className={styles.contentRow}
        style={{ "--reveal-delay": "1500ms" } as CSSProperties}
      >
        <SectionTag>Featured Work</SectionTag>
      </div>
      <div
        className={styles.viewport}
        ref={viewportRef}
        id="featured-track"
        data-reveal-scope=""
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
          {Array.from({ length: SLIDE_COUNT * 3 }, (_, physicalSlideIndex) => {
            const slideIndex = physicalSlideIndex % SLIDE_COUNT;
            const clone = physicalSlideIndex < SLIDE_COUNT || physicalSlideIndex >= SLIDE_COUNT * 2;
            return (
              <FeaturedSlide
                index={slideIndex}
                clone={clone}
                key={physicalSlideIndex}
              />
            );
          })}
        </div>
      </div>
      <div
        className={styles.contentRow}
        data-reveal="fade"
        style={{ "--reveal-delay": "1700ms" } as CSSProperties}
      >
        <div className={styles.controls}>
          <button
            className={styles.arrowButton}
            type="button"
            aria-label="Show previous featured project"
            aria-controls="featured-track"
            onClick={showPrevious}
          >
            <Image
              src="/assets/featured/carousel-arrow.svg"
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
              src="/assets/featured/carousel-arrow.svg"
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
