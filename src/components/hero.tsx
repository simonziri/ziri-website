import Image from "next/image";
import { MobileLogoWall } from "./mobile-logo-wall";
import { PixelHatchButton } from "./pixel-hatch-button";
import styles from "./home-sections.module.css";

export function Hero() {
  return (
    <header className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.heroIntro}>
          <p
            className={styles.kicker}
            data-reveal="fade"
            style={{ "--reveal-duration": "1650ms" } as React.CSSProperties}
          >
            For B2B companies with high contract values.
          </p>
          <h1 className={styles.heroTitle} id="hero-title">
            <span data-reveal="sweep">We build your website on why buyers choose you,</span>{" "}
            <span data-reveal="sweep">and why they don&rsquo;t.</span>
          </h1>
        </div>

        <p
          className={styles.heroDescription}
          data-reveal="fade"
          style={{ "--reveal-delay": "200ms", "--reveal-duration": "1650ms" } as React.CSSProperties}
        >
          We research your lost deals, your buyers, and how AI models describe
          you against competitors, then build your site around the difference
          only you can claim.
        </p>
      </div>

      <div className={styles.heroFooter}>
        <div
          className={styles.heroActions}
          data-reveal="fade"
          style={{ "--reveal-delay": "350ms", "--reveal-duration": "1650ms" } as React.CSSProperties}
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

        <div data-reveal="fade" style={{ "--reveal-delay": "500ms", "--reveal-duration": "1650ms" } as React.CSSProperties} className={styles.logoStrip} aria-label="Selected ZIRI clients">
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
