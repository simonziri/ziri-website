"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PixelHatchButton } from "./pixel-hatch-button";
import styles from "./site-footer.module.css";

const footerLinks: ReadonlyArray<{
  label: string;
  href: string;
  active?: boolean;
}> = [
  { label: "Cases", href: "/#featured-work" },
  { label: "Method", href: "/#customer" },
  { label: "Work with us", href: "/#contact", active: true },
  { label: "FAQ", href: "/#faq" },
] as const;

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const bounds = footer.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;

      const raw = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
      const progress = Math.min(1, Math.max(0, raw));
      // Parallax: Artwork startet tiefer und halbtransparent, slidet mit dem Scroll hoch
      footer.style.setProperty("--footer-parallax-y", `${(1 - progress) * 260}px`);
      footer.style.setProperty(
        "--footer-artwork-opacity",
        `${Math.min(1, progress * 1.6).toFixed(3)}`,
      );
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <footer className={styles.footer} id="site-footer" ref={footerRef}>
      <div className={styles.head}>
        <h2>
          <span>Let’s make sure your</span>{" "}
          <span>website sells</span>
        </h2>
        <nav className={styles.navigation} aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <PixelHatchButton
              className={`${styles.footerButton} ${link.active ? styles.footerButtonActive : ""}`}
              href={link.href}
              variant={link.active ? "secondary" : "primary"}
              key={link.href}
            >
              {link.label}
            </PixelHatchButton>
          ))}
        </nav>
        <div className={styles.legal}>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/imprint">Imprint</Link>
          <a
            href="https://www.linkedin.com/in/simonziri/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
      <div className={styles.footerArtwork}>
        <Image
          className={styles.footerImage}
          src="/assets/footer-image.avif"
          alt="ZIRI pixel wordmark"
          fill
          sizes="100vw"
        />
      </div>
    </footer>
  );
}
