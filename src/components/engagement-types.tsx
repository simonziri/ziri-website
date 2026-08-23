import { PixelHatchButton } from "./pixel-hatch-button";
import { SectionTag } from "./section-tag";
import styles from "./engagement-types.module.css";

const engagements = [
  {
    id: "diagnosis",
    tier: "Diagnosis",
    heading: "The evidence base: why you lose, and the play that fixes it.",
    audience:
      "For teams that want decision-grade evidence before committing to anything. Fixed price, two to three weeks, and valuable on its own even if we never build a page.",
    deliverables: [
      "Buyer evidence from reviews, communities, and sales calls",
      "Sameness Map: what your whole category claims",
      "AI-representation check against named competitors",
      "Edge Selection: one recommended play, with the evidence trail",
      "Roadmap and formal go or no-go",
    ],
  },
  {
    id: "rebuild",
    tier: "Rebuild",
    heading: "The messaging system, and the site that carries it to market.",
    audience:
      "For companies ready to rebuild on evidence instead of taste. Pages ship in Waves on a fixed cadence, highest-leverage first, so the important pages go live early.",
    deliverables: [
      "Messaging system built on your selected play",
      "Brand and identity, when the project calls for it",
      "Design and build in Waves, with a readout per Wave",
      "Clarity Tests with people matching your buyer profile",
      "After-picture: AI check and baseline re-measured",
      "Full handover: components, training, CMS",
    ],
  },
  {
    id: "retainer",
    tier: "Retainer",
    heading: "The Waves continue — so you stay the most present option.",
    audience:
      "For teams that want the research corpus and the site to keep improving — and the right door if your site is live but underperforming: Diagnosis first, then Waves on the pages you already have. You set the cadence, priced per Wave, minimum three.",
    deliverables: [
      "One new research round per Wave, into your private corpus",
      "AI-representation monitoring across models",
      "Implementation batch informed by the round",
      "Wave readout: what we learned, what moved, what ships next",
    ],
  },
] as const;

export function EngagementTypes() {
  return (
    <section className={styles.section} id="services" aria-labelledby="engagement-title">
      <div className={styles.heading}>
        <SectionTag>Engagement types</SectionTag>
        <h2 id="engagement-title">
          <span data-reveal="sweep">One partner across the whole evaluation phase.</span>{" "}
          <span data-reveal="sweep">
            Everything after the buyer has found you, and before they sign.
          </span>
        </h2>
      </div>

      <div className={styles.list}>
        {engagements.map((engagement) => (
          <article className={styles.item} data-scroll-enter="fade" key={engagement.id}>
            <header className={styles.itemHeading}>
              <div className={styles.tier}>
                <span>{engagement.tier}</span>
              </div>
              <h3>{engagement.heading}</h3>
            </header>

            <div className={styles.details}>
              <div className={styles.audience}>
                <h4>Who this is for</h4>
                <p>{engagement.audience}</p>
                <PixelHatchButton href="#contact">Get a quote</PixelHatchButton>
              </div>

              <div className={styles.deliverables}>
                <h4>Deliverables</h4>
                <ul>
                  {engagement.deliverables.map((deliverable) => (
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
