import { InViewVideo } from "./in-view-video";
import { SectionTag } from "./section-tag";
import styles from "./paradox.module.css";

const paradoxCards = [
  {
    title: "Low conversion rates, low close rates",
    body: "Traffic lands but rarely turns into pipeline — and the deals that reach sales close less often than your product deserves.",
    video: "/media/paradox-low-conversion.mp4",
    freezeAtEnd: false,
  },
  {
    title: "Price fights you shouldn’t be in",
    body: "You look comparable to cheaper options, so buyers negotiate the price, even though you bring more value.",
    video: "/media/paradox-price-focus.mp4",
    freezeAtEnd: false,
  },
  {
    // Provisorisch: nur Standbild (letzter Frame), zwei laufende Videos reichen
    title: "“We went another direction.”",
    body: "Deals you were sure of go quiet, then you learn they went with the established competitor.",
    video: "/media/paradox-losing-deals.mp4",
    freezeAtEnd: true,
  },
] as const;

export function Paradox() {
  return (
    <section className={styles.section} id="paradox" aria-labelledby="paradox-title">
      <div className={styles.header}>
        <SectionTag>The paradox</SectionTag>
        <h2 className={styles.title} id="paradox-title">
          <span data-reveal="sweep">Traffic is healthy and your customers love you.</span>
          <span data-reveal="sweep">Yet acquisition gets pricier and deals go to the established name.</span>
        </h2>
      </div>

      <div className={styles.cardGrid}>
        {paradoxCards.map((card, index) => (
          <article
            className={styles.card}
            data-reveal="rise"
            style={{ "--reveal-delay": `${index * 140}ms` } as React.CSSProperties}
            key={card.title}
          >
            <InViewVideo
              className={styles.cardVideo}
              src={card.video}
              label={`Animated illustration: ${card.title}`}
              freezeAtEnd={card.freezeAtEnd}
            />
            <div className={styles.cardCopy}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
