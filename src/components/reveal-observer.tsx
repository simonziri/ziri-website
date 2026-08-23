"use client";

import { useEffect } from "react";

/**
 * Arms all [data-reveal] elements once they scroll into view by setting
 * data-inview="true" — the animations themselves live in globals.css.
 * Watches the DOM so late-mounted content (e.g. the case study panel)
 * is picked up too.
 */
export function RevealObserver() {
  useEffect(() => {
    const arm = (element: Element) =>
      element.setAttribute("data-inview", "true");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target;
          if (target.hasAttribute("data-reveal")) arm(target);
          // Scope-Container armieren ihre versteckten Kinder mit
          // (z.B. Slides, die per translateY außerhalb des Viewports liegen).
          target
            .querySelectorAll("[data-reveal]:not([data-inview])")
            .forEach(arm);
          io.unobserve(target);
        }
      },
      { threshold: 0.15 },
    );

    const observeAll = () => {
      document
        .querySelectorAll("[data-reveal]:not([data-inview])")
        .forEach((element) => {
          // Immer einen sichtbaren Vorfahren beobachten: versteckte Zustände
          // (clip-path, translateY) schneiden den Viewport sonst nie.
          io.observe(
            element.closest("[data-reveal-scope]") ??
              element.parentElement ??
              element,
          );
        });
    };

    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
