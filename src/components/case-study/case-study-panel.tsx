"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./case-study-panel.module.css";

/** Muss zur transition-Dauer von .panel im CSS passen. */
const SLIDE_OUT_MS = 1050;

/**
 * Slide-over shell for intercepted /work/[slug] navigations.
 * The same content is served as a standalone page on direct visits,
 * so crawlers and deep links always get a real document.
 *
 * Closing plays the slide-out first, then navigates back — the panel
 * only exists through an intercepted navigation from the homepage, and
 * "Next Case" links use replace, so back() always lands on the homepage.
 * Elements marked [data-panel-close] (the article's back link) are
 * intercepted here so they close with the same animation.
 */
export function CaseStudyPanel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closingRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
    window.setTimeout(() => router.back(), SLIDE_OUT_MS);
  };

  useEffect(() => {
    let inner = 0;
    const frame = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOpen(true));
    });
    panelRef.current?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(inner);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Beim Wechsel zwischen Cases (Next Case) im Panel nach oben springen.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div
      className={styles.root}
      data-open={open}
      onClickCapture={(event) => {
        const target = event.target as Element;
        if (target.closest?.("[data-panel-close]")) {
          event.preventDefault();
          close();
        }
      }}
    >
      <button
        className={styles.overlay}
        type="button"
        aria-label="Close case study"
        tabIndex={-1}
        onClick={close}
      />
      <aside
        className={styles.panel}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Case study"
        tabIndex={-1}
      >
        <div className={styles.scroller} ref={scrollerRef}>
          {children}
        </div>
      </aside>
    </div>
  );
}
