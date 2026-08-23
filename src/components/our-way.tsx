import { SectionTag } from "./section-tag";
import styles from "./our-way.module.css";

export function OurWay() {
  return (
    <section className={styles.section} id="our-way" aria-labelledby="our-way-title">
      <div className={styles.heading}>
        <SectionTag>Our Point of View</SectionTag>
        <h2 className={styles.title} id="our-way-title">
        <span data-reveal="sweep">Typical website projects are driven by opinions and best practices.</span>{" "}
        <span data-reveal="sweep">Ours run on a deep understanding of your market and ICP.</span>
        </h2>
      </div>

      <div className={styles.cardGrid}>
        <article className={`${styles.card} ${styles.oldWay}`} data-reveal="rise">
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>OLD WAY</p>
            <h3>New design, new wording, same message underneath.</h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              The big decisions get made in a meeting room: what the founder
              likes, what a competitor does, and best practices.
            </p>
            <p>
              As a result, key decisions are made from opinions and best
              practices borrowed from companies in completely different phases
              and industries. Competitors are being copied — so instead of
              standing out, you go under. When your contracts are worth five to
              seven figures, this approach doesn’t cut it.
            </p>
          </div>
        </article>

        <article
          className={`${styles.card} ${styles.ziriWay}`}
          data-reveal="rise"
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
        >
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>ZIRI WAY</p>
            <h3>
              We build the other way around: first why you lose, then the
              language, then the design.
            </h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              Large, often committee-driven, deals are signed when gut and
              brain agree. The site feels credible immediately and holds up
              under months of scrutiny.
            </p>
            <p>
              Website analytics, buyer and competitor data are our foundation.
              From there, we build a strategy made to win against established
              competitors. For committee-driven sales: long cycles, multiple
              stakeholders, high contract values.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
