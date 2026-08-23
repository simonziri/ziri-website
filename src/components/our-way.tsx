import { SectionTag } from "./section-tag";
import styles from "./our-way.module.css";

export function OurWay() {
  return (
    <section className={styles.section} id="our-way" aria-labelledby="our-way-title">
      <div className={styles.heading}>
        <SectionTag>Our Point of View</SectionTag>
        <h2 className={styles.title} id="our-way-title">
        <span data-reveal="sweep">The answer isn’t another redesign or blind A/B testing.</span>{" "}
        <span data-reveal="sweep">You need a website built for multi-layered sales cycles.</span>
        </h2>
      </div>

      <div className={styles.cardGrid}>
        <article className={`${styles.card} ${styles.oldWay}`}>
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>OLD WAY</p>
            <h3>
              CRO agencies sell rapid A/B testing. Design agencies sell redesigns.
              <br />
              Both rarely work out in B2B.
            </h3>
          </div>
          <p className={styles.cardBody}>
            Beautiful websites are rarely built for results.
            <br />
            <br />
            Classic CRO agencies work best with high volume. For most B2B companies,
            experiments take months until they’re significant, so rapid A/B testing
            cannot be the driver of the project.
          </p>
        </article>

        <article className={`${styles.card} ${styles.ziriWay}`}>
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>ZIRI WAY</p>
            <h3>
              Customer-led and differentiation-first websites so you win during
              unpredictable sales cycles.
            </h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              It’s no coincidence that companies like Ramp crush their competition.
              They found out that to win big deals, brain and gut need to be aligned.
            </p>
            <p>
              <strong>We bet on customer-research as our source of truth.</strong>
              <br />
              Differentiation and clarity as your unfair advantage.
              <br />
              Messaging and design for execution.
              <br />
              A/B tests for validation.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
