"use client";

import { useEffect } from "react";

/**
 * Flippt das globale Theme auf dark-primary, sobald die Contact-Section
 * (#contact) beim Scrollen erreicht wird — und zurück auf light, wenn
 * man wieder darüber scrollt. Hier passiert KEINE Animation: es wird
 * nur das data-theme-Attribut getoggelt; die Überblendung machen die
 * permanenten CSS-Transitions in globals.css (--theme-flip-duration).
 */
export function ThemeScrollShift() {
  useEffect(() => {
    const target = document.getElementById("contact");
    if (!target) return;

    const root = document.documentElement;
    let isDark = false;

    const update = () => {
      // Trigger: Oberkante der Section erreicht das untere Viewport-Drittel
      const dark = target.getBoundingClientRect().top < window.innerHeight * 0.65;
      if (dark === isDark) return;
      isDark = dark;
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
    };
  }, []);

  return null;
}
