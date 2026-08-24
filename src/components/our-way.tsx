import { SectionTag } from "./section-tag";
import styles from "./our-way.module.css";

export function OurWay() {
  return (
    <section className={styles.section} id="our-way" aria-labelledby="our-way-title">
      <div className={styles.heading}>
        <SectionTag>Our Point of View</SectionTag>
        <h2 className={styles.title} id="our-way-title">
        <span data-reveal="sweep">Most websites are built on opinions and disconnected from why your buyers actually chose you.</span>
        </h2>
      </div>

      <div className={styles.cardGrid}>
        <article className={`${styles.card} ${styles.oldWay}`} data-reveal="rise">
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>TYPICAL WEBSITE PROJECTS</p>
            <h3>Classic web agencies let you build the brief and call it a day</h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              Critical decisions are made from opinions and best practices borrowed from companies in completely different phases and industries.
            </p>
            <p>
              On top of that, competitors are being blindly copied, so instead of standing out, you go under. When your contracts are worth five to seven figures, this approach doesn’t cut it.
            </p>
          </div>
        </article>

        <article
          className={`${styles.card} ${styles.ziriWay}`}
          data-reveal="rise"
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
        >
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>ZIRI&rsquo;S APPROACH</p>
            <h3>
              We build and validate a playbook based on your buyer insights first
            </h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              By studying your market and sales insights, we build assumptions on what actually matters to make you the obvious choice.
            </p>
            <p>
              We bring those assumptions to you to challenge them. Whatever survived gets validated in front of your ideal customer. When we found a winner, we build your messaging, brand and website exactly on that discovered edge.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
