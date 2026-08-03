import { PixelHatchButton } from "./pixel-hatch-button";
import { SectionTag } from "./section-tag";
import styles from "./engagement-types.module.css";

const engagements = [
  { id: "minimum", tier: "Minimum" },
  { id: "core-one", tier: "Core" },
  { id: "core-two", tier: "Core" },
] as const;

const deliverables = [
  "Messaging Workshop & Messaging Doc",
  "Landing Page design & messaging Revamp",
  "Homepage & messaging Revamp",
  "Consulting",
] as const;

export function EngagementTypes() {
  return (
    <section className={styles.section} id="services" aria-labelledby="engagement-title">
      <div className={styles.heading}>
        <SectionTag>Engagement Types</SectionTag>
        <h2 id="engagement-title">
          CTRs are healthy and your customers love you. Yet, CAC is high and you
          keep losing deals.
        </h2>
      </div>

      <div className={styles.list}>
        {engagements.map((engagement) => (
          <article className={styles.item} key={engagement.id}>
            <header className={styles.itemHeading}>
              <div className={styles.tier}>{engagement.tier}</div>
              <h3>We audit and refine what’s already there. Highest ROI first.</h3>
            </header>

            <div className={styles.details}>
              <div className={styles.audience}>
                <h4>Who this is for</h4>
                <p>
                  Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum, ac aliquet odio mattis. Class
                  aptent taciti sociosqu ad litora torquent per conubia nostra.
                  Curabitur tempus urna at turpis condimentum lobortis.
                </p>
                <PixelHatchButton href="#contact">Get a quote</PixelHatchButton>
              </div>

              <div className={styles.deliverables}>
                <h4>Deliverables (pick what you need)</h4>
                <ul>
                  {deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
