import { InViewVideo } from "./in-view-video";
import { SectionTag } from "./section-tag";
import styles from "./paradox.module.css";

const paradoxCards = [
  {
    title: "Low conversion rates, long sales cycles",
    video: "/media/paradox-low-conversion.mp4",
    freezeAtEnd: false,
  },
  {
    title: "Clients focus on price instead of your value",
    video: "/media/paradox-price-focus.mp4",
    freezeAtEnd: false,
  },
  {
    // Provisorisch: nur Standbild (letzter Frame), zwei laufende Videos reichen
    title: "You keep losing against worse competitors.",
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
          <span data-reveal="sweep">CTRs are healthy and your customers love you.</span>
          <span data-reveal="sweep">Yet, CAC is high and you keep losing deals.</span>
        </h2>
      </div>

      <div className={styles.cardGrid}>
        {paradoxCards.map((card) => (
          <article className={styles.card} key={card.title}>
            <InViewVideo
              className={styles.cardVideo}
              src={card.video}
              label={`Animated illustration: ${card.title}`}
              freezeAtEnd={card.freezeAtEnd}
            />
            <div className={styles.cardCopy}>
              <h3>{card.title}</h3>
              <p>
                Yorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                vulputate libero et velit interdum, ac aliquet odio mattis.
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
