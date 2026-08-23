import Image from "next/image";
import { MobileLogoWall } from "./mobile-logo-wall";
import { PixelHatchButton } from "./pixel-hatch-button";
import styles from "./home-sections.module.css";

export function Hero() {
  return (
    <header className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.heroIntro}>
          <p className={styles.kicker} data-reveal="fade">
            Fix your CAC &amp; CVR: Websites and Brands built to win long sales cycles.
          </p>
          <h1 className={styles.heroTitle} id="hero-title" data-reveal="sweep">
            In B2B Tech, your website can’t afford to be confusing and commoditized.
          </h1>
        </div>

        <p
          className={styles.heroDescription}
          data-reveal="fade"
          style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
        >
          High CaC, low conversion rates, low , price fights and lost deals are
          expensive. We bet on customer-research, differentiation and clarity, so
          websites win during realistic sales cycles.
        </p>
      </div>

      <div className={styles.heroFooter}>
        <div
          className={styles.heroActions}
          data-reveal="fade"
          style={{ "--reveal-delay": "350ms" } as React.CSSProperties}
        >
          <PixelHatchButton className={styles.heroButton} href="#contact">
            Work with us
          </PixelHatchButton>
          <PixelHatchButton
            className={styles.heroButton}
            href="#our-way"
            variant="secondary"
          >
            Explore our method
          </PixelHatchButton>
        </div>

        <div data-reveal="fade" style={{ "--reveal-delay": "500ms" } as React.CSSProperties} className={styles.logoStrip} aria-label="Selected ZIRI clients">
          <div className={styles.logoCell}>
            <Image src="/assets/tab-logos/HockeyStack.svg" alt="HockeyStack" width={262} height={58} />
          </div>
          <div className={styles.logoCell}>
            <Image src="/assets/tab-logos/Leapsome.svg" alt="Leapsome" width={262} height={58} />
          </div>
          <div className={styles.logoCell}>
            <Image src="/assets/tab-logos/Circula.svg" alt="Circula" width={262} height={58} />
          </div>
          <div className={styles.logoCell}>
            <Image src="/assets/tab-logos/Instaffo.svg" alt="Instaffo" width={262} height={58} />
          </div>
        </div>
        <MobileLogoWall />
      </div>
    </header>
  );
}
