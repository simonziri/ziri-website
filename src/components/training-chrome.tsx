import Link from "next/link";
import styles from "@/app/training/training.module.css";
import { CookieSettingsButton } from "./cookie-settings-button";

/* Fokussierte Chrome für /training/*: Logo ohne Navigation, Minimal-Footer
   (nur Legal-Links), damit die Landingpage keinen Ausstieg anbietet. */

export function TrainingHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} href="/" aria-label="ZIRI home">
        {/* Gleiches Inline-SVG wie in site-header.tsx (currentColor) */}
        <svg
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
    </header>
  );
}

export function TrainingFooter() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} ZIRI GmbH</span>
      <nav aria-label="Legal">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/imprint">Imprint</Link>
        <CookieSettingsButton />
      </nav>
    </footer>
  );
}
