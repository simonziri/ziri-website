"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { PixelHatchButton } from "./pixel-hatch-button";
import styles from "./home-sections.module.css";

const navigation = [
  { label: "Cases", href: "/#featured-work" },
  { label: "Method", href: "/#customer" },
  { label: "Service", href: "/#services" },
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
          <Image
            src="/assets/ziri-logo.svg"
            alt="ZIRI"
            width={77}
            height={30}
            priority
          />
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
