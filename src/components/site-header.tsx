"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { PixelHatchButton } from "./pixel-hatch-button";
import styles from "./home-sections.module.css";

const navigation = [
  { label: "Cases", href: "/#featured-work" },
  { label: "Method", href: "/#customer" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={styles.header} aria-label="Primary navigation">
      <div className={styles.navWrap} data-scrolled={scrolled}>
        <Link className={styles.logoLink} href="/" aria-label="ZIRI home">
          {/* Inline-SVG mit currentColor: erbt die Token-Farbe und
              wird beim Theme-Flip automatisch weiß */}
          <svg
            className={styles.logoMark}
            width="77"
            height="31"
            viewBox="0 0 77 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="ZIRI"
          >
            <path d="M77 30.0674H65.9375V0H77V30.0674Z" fill="currentColor" />
            <path
              d="M53.1914 1.98535H53.4756C53.9294 1.49379 54.6101 1.03997 55.5176 0.624023C56.4253 0.207999 57.4464 5.71137e-06 58.5811 0H63.6865V10.2119H58.5811C56.9926 10.2119 55.7822 10.6467 54.9502 11.5166C54.156 12.3486 53.7588 13.6156 53.7588 15.3174V30.0674H42.6963V0H52.624L53.1914 1.98535Z"
              fill="currentColor"
            />
            <path d="M40.2583 30.0674H29.1958V0H40.2583V30.0674Z" fill="currentColor" />
            <path
              d="M26.3799 9.36035L14.75 20.4229H26.6641V30.0674H0V20.707L11.6299 9.64453H0.283203V0H26.3799V9.36035Z"
              fill="currentColor"
            />
          </svg>
        </Link>

        <div className={styles.navigation}>
          <div className={styles.navigationLinks}>
            {navigation.map((item) => (
              <Link className={styles.navigationLink} href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <PixelHatchButton className={styles.headerCta} href="#contact">
            Work with us
          </PixelHatchButton>
          <button
            className={styles.menuButton}
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            data-open={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={styles.mobileMenu}
        id="mobile-navigation"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <nav className={styles.mobileMenuLinks} aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <Link
              className={styles.mobileMenuLink}
              href={item.href}
              onClick={closeMenu}
              style={{ "--menu-index": index } as CSSProperties}
              key={item.href}
            >
              <span>0{index + 1}</span>
              {item.label}
            </Link>
          ))}
          <Link
            className={styles.mobileMenuCta}
            href="#contact"
            onClick={closeMenu}
          >
            Work with us
          </Link>
        </nav>
      </div>
    </nav>
  );
}
