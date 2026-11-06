import { SectionTag } from "./section-tag";
import styles from "./our-way.module.css";

export function OurWay() {
  return (
    <section className={styles.section} id="our-way" aria-labelledby="our-way-title">
      <div className={styles.heading}>
        <SectionTag>Our Point of View</SectionTag>
        <h2 className={styles.title} id="our-way-title">
        <span data-reveal="sweep">Most web agencies treat strategy as a one-time thing.</span>{" "}
        <span data-reveal="sweep">We keep questioning, designing, building and improving.</span>
        </h2>
      </div>

      <div className={styles.cardGrid}>
        <article className={`${styles.card} ${styles.oldWay}`} data-reveal="rise">
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>TYPICAL AGENCY RETAINER</p>
            <h3>Strategy at the start. Design and development tickets from there.</h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              After launch, the relationship becomes about briefs, requests and available capacity.
            </p>
            <p>
              But companies keep changing. New buyers, new positioning, new priorities. Executing the next task is only part of the job.
            </p>
          </div>
        </article>

        <article
          className={`${styles.card} ${styles.ziriWay}`}
          data-reveal="rise"
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
        >
          <div className={styles.cardHeading}>
            <p className={styles.cardLabel}>THE ZIRI PARTNERSHIP</p>
            <h3>
              Strategic sparring, design and development. Together, ongoing.
            </h3>
          </div>
          <div className={styles.cardBody}>
            <p>
              Work directly with our founder and in-house design and development leads to sharpen the direction and put it live.
            </p>
            <p>
              Regular leadership sessions keep the bigger picture moving, while reserved capacity keeps everyday requests on track.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
