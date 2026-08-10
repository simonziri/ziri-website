import { PixelHatchButton } from "./pixel-hatch-button";
import { PixelWordmark } from "./pixel-wordmark";
import styles from "./site-footer.module.css";

const footerLinks: ReadonlyArray<{
  label: string;
  href: string;
  active?: boolean;
}> = [
  { label: "Services", href: "#services" },
  { label: "Method", href: "#our-way" },
  { label: "Work with us", href: "#contact", active: true },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Work", href: "#featured-work" },
] as const;

// Parked backup of the previous interactive footer. This module is intentionally
// not imported by the page, so none of its animation code is active on the site.
export function LegacySiteFooter() {
  return (
    <footer className={styles.legacyFooter} data-theme="dark-primary">
      <div className={styles.lattice} aria-hidden="true" />
      <div className={styles.head}>
        <h2>Let’s make sure your website smokes the competition.</h2>
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
      </div>
      <PixelWordmark />
    </footer>
  );
}
