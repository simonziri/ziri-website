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
            For B2B companies selling five to seven figure deals.
          </p>
          <h1 className={styles.heroTitle} id="hero-title">
            <span data-reveal="sweep">Your website fails you,</span>{" "}
            <span data-reveal="sweep">because it was built on opinions.</span>
          </h1>
        </div>

        <p
          className={styles.heroDescription}
          data-reveal="fade"
          style={{ "--reveal-delay": "200ms", "--reveal-duration": "1650ms" } as React.CSSProperties}
        >
          Your market and your sales intel are gold mines to uncover what makes you the obvious choice. We recommend and validate a playbook and only then build your website around it.
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
