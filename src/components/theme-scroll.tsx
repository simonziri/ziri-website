"use client";

import { useEffect } from "react";

/**
 * Flippt das globale Theme auf dark-primary, sobald die Contact-Section
 * (#contact) beim Scrollen erreicht wird — und zurück auf light, wenn
 * man wieder darüber scrollt. data-theme-anim liegt nur während des
 * Flips auf <html>: globals.css erzwingt darüber EINE gemeinsame
 * Transition für alle Elemente (synchron), ohne dauerhaft die
 * Hover-/Komponenten-Transitions zu überschreiben.
 */
export function ThemeScrollShift() {
  useEffect(() => {
    const target = document.getElementById("contact");
    if (!target) return;

    const root = document.documentElement;
    let isDark: boolean | null = null;
    let animTimer = 0;

    const apply = (dark: boolean) => {
      if (dark === isDark) return;
      const initial = isDark === null;
      isDark = dark;

      // Initialzustand (z. B. wiederhergestellte Scroll-Position)
      // ohne Überblendung setzen
      if (!initial) {
        root.setAttribute("data-theme-anim", "");
        window.clearTimeout(animTimer);
        animTimer = window.setTimeout(
          () => root.removeAttribute("data-theme-anim"),
          520,
        );
      }

      if (dark) root.setAttribute("data-theme", "dark-primary");
      else root.removeAttribute("data-theme");
    };

    // Scroll-Events sind bereits frame-getaktet; getBoundingClientRect
    // pro Event ist billig genug, kein rAF-Throttling nötig.
    const update = () => {
      // Trigger: Oberkante der Section erreicht das untere Viewport-Drittel
      apply(target.getBoundingClientRect().top < window.innerHeight * 0.65);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(animTimer);
      root.removeAttribute("data-theme");
      root.removeAttribute("data-theme-anim");
    };
  }, []);

  return null;
}
