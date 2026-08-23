"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./case-study-panel.module.css";

/**
 * Slide-over shell for intercepted /work/[slug] navigations.
 * The same content is served as a standalone page on direct visits,
 * so crawlers and deep links always get a real document.
 *
 * Closing uses history.back(): the panel only exists through an intercepted
 * navigation from the homepage, and "Next Case" links use replace, so the
 * previous history entry is always the homepage.
 */
export function CaseStudyPanel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

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
      if (event.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  // Beim Wechsel zwischen Cases (Next Case) im Panel nach oben springen.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.root} data-open={open}>
      <button
        className={styles.overlay}
        type="button"
        aria-label="Close case study"
        tabIndex={-1}
        onClick={() => router.back()}
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
