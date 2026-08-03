import Image from "next/image";
import Link from "next/link";
import styles from "./home-sections.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.heroIntro}>
          <p className={styles.kicker}>
            Fix your CAC &amp; CVR: Websites and Brands built to win long sales cycles.
          </p>
          <h1 className={styles.heroTitle} id="hero-title">
            In B2B Tech, your website can’t afford to be confusing and commoditized.
          </h1>
        </div>

        <p className={styles.heroDescription}>
          High CaC, low conversion rates, low , price fights and lost deals are
          expensive. We bet on customer-research, differentiation and clarity, so
          websites win during realistic sales cycles.
        </p>
      </div>

      <div className={styles.heroFooter}>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="#contact">
            Work with us
          </Link>
          <Link className={styles.secondaryButton} href="#method">
            Explore our method
          </Link>
        </div>

        <div className={styles.logoStrip} aria-label="Selected ZIRI clients">
          <div className={styles.logoCell}>
            <div className={styles.hockeyStackLogo}>
              <Image
                src="/assets/hockeystack.svg"
                alt=""
                width={10}
                height={11}
              />
              <Image
                src="/assets/hockeystack-wordmark.svg"
                alt="HockeyStack"
                width={89}
                height={14}
              />
            </div>
          </div>
          <div className={styles.logoCell}>
            <Image
              src="/assets/leapsome.svg"
              alt="Leapsome"
              width={75}
              height={17}
            />
          </div>
          <div className={styles.logoCell}>
            <Image
              src="/assets/circula.svg"
              alt="Circula"
              width={267}
              height={88}
              style={{ width: "133.5px", height: "44px" }}
            />
          </div>
          <div className={styles.logoCell}>
            <Image
              src="/assets/instaffo.svg"
              alt="Instaffo"
              width={65}
              height={14}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
