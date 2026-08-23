"use client";

import { useEffect } from "react";

/**
 * Flippt das globale Theme auf dark-primary, sobald die Contact-Section
 * (#contact) beim Scrollen erreicht wird — und zurück auf light, wenn
 * man wieder darüber scrollt. Die weichen Farbwechsel kommen aus
 * globals.css über html[data-theme-anim].
 */
export function ThemeScrollShift() {
  useEffect(() => {
    const target = document.getElementById("contact");
    if (!target) return;

    const root = document.documentElement;
    root.setAttribute("data-theme-anim", "");

    // Scroll-Events sind bereits frame-getaktet; getBoundingClientRect
    // pro Event ist billig genug, kein rAF-Throttling nötig.
    const update = () => {
      // Trigger: Oberkante der Section erreicht das untere Viewport-Drittel
      const dark = target.getBoundingClientRect().top < window.innerHeight * 0.65;
      if (dark) root.setAttribute("data-theme", "dark-primary");
      else root.removeAttribute("data-theme");
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      root.removeAttribute("data-theme");
      root.removeAttribute("data-theme-anim");
    };
  }, []);

  return null;
}
