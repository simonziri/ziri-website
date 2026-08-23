"use client";

import Image from "next/image";
import { useState } from "react";
import { PixelHatchButton } from "./pixel-hatch-button";
import { SectionTag } from "./section-tag";
import styles from "./faq-section.module.css";

const groups = [
  {
    id: "faq-about",
    title: "About ZIRI",
    items: [
      {
        q: "What’s actually different about ZIRI?",
        a: "We start from why you lose deals: reviews, communities, and your recorded sales calls, before anyone opens a design tool. Agencies in this space front-load design; we front-load research, because at high deal values, evidence is the only engine that works. One team carries it from research to launch.",
      },
      {
        q: "What do you mean by committee-driven sales?",
        a: "The motion where a committee decides: high contract values, long cycles, and one internal champion carrying your case into rooms you never enter. Our method is built for that. The site gets you considered in minutes, and it gives your champion the rationale and the ammunition to keep making your case for months after.",
      },
      {
        q: "Are you an AEO or AI-search agency?",
        a: "No. AEO works before the click; we work after it. Your buyer is already on your site, comparing you to two competitors, and asking ChatGPT to compare you too. If the AI explains your competitor better than it explains you, you lose that comparison, and that is the part we fix. AEO gets you into the room. We make sure you win the room.",
      },
      {
        q: "Do you do SEO, ads, or demand gen?",
        a: "No. We own the evaluation phase: everything after the buyer has found you and before they sign. For demand gen we have a partner agency that plugs cleanly into our process, so nothing falls between two vendors.",
      },
      {
        q: "Why research instead of A/B testing?",
        a: "At typical B2B high-ticket traffic, a single test takes around two months per page to conclude, which is too slow to drive a project. So we front-load research, ship informed bets, and test only where a page has the volume. We are open about what significance is reachable at your traffic and what isn’t.",
      },
    ],
  },
  {
    id: "faq-method",
    title: "How we work with you",
    items: [
      {
        q: "Our site is fairly new. Do we still need a full relaunch?",
        a: "No. If the design holds, we don’t touch it for the sake of touching it. Diagnosis finds why deals stall, and the fixes ship in Waves on your existing site: messaging, key pages, sales material. Many clients start exactly there and never do a classic relaunch.",
      },
      {
        q: "What does an engagement look like?",
        a: "Diagnosis first: two to three weeks of buyer evidence, the AI-representation check, and Edge Selection, which closes with one recommended differentiation play and a formal go or no-go, and no-go is an honest possible outcome. Then the work ships in Waves, highest-leverage pages first. We don’t rebuild anything we haven’t researched.",
      },
      {
        q: "Our CRM is messy and we barely record calls. Is there anything to research?",
        a: "Almost always, yes. This is the normal starting state, and the method is built for low volume: a handful of recorded calls and twenty meaningful deals at €30k+ is a rich corpus, plus reviews and communities across your whole category. In week one we run an evidence checkpoint: enough signal to pick a play, or not. If not, we say so right then, and buyer interviews extend the research. Where evidence stays thin, the workshop with your team becomes the primary source, and the findings document says so in writing. Where your team’s beliefs and the data disagree, we record it as a finding and resolve it in the findings session, with the evidence on the table. Loss reasons logged as “budget” don’t worry us either; in most deals, budget is the cover story for “they didn’t see the value.”",
      },
      {
        q: "What if the website isn’t our real problem?",
        a: "Then Diagnosis says so. It ends in a formal go or no-go, and no-go is a real outcome: when the evidence points at product gaps, pricing, or a positioning decision only your CEO can make, the readout names it instead of selling you a rebuild. You keep the evidence and the roadmap either way.",
      },
      {
        q: "How long until the new site is live?",
        a: "Pages ship in Waves of two to three weeks, home and key landing pages first. You see the highest-leverage pages live early instead of waiting months for a big-bang launch, and every Wave closes with a readout on what shipped and why.",
      },
      {
        q: "How do you measure success?",
        a: "Pipeline evidence from your own CRM: fewer re-explanations on recorded calls, higher show-up rates, better-qualified conversations, deals that keep moving. Plus the AI-representation before and after, and acquisition cost where your data carries it. Conversion we report directionally. We don’t publish uplift numbers a sample can’t support.",
      },
      {
        q: "Do we see the messaging validated before it ships?",
        a: "Yes, twice. The selected play is pressure-tested in real sales conversations before we build on it. And before messaging ships, the Clarity Test: three to five people matching your buyer profile, and the AI models your buyers use, all asked the same four questions. When both readers retell your differentiation, it ships.",
      },
    ],
  },
  {
    id: "faq-clients",
    title: "Who we work with",
    items: [
      {
        q: "Who is ZIRI a good fit for?",
        a: "B2B companies with high contract values, often €30k and up per deal, in long, committee-driven sales, with real acquisition spend but low lead volume, so every lost deal hurts. Usually software or hardware, though the fit is your sales motion and deal size, not your industry.",
      },
      {
        q: "Who is ZIRI not for?",
        a: "Pre-traction companies with no buyers to research yet. Teams that want the cheapest option, or a visual refresh with the same message underneath. Purely RFP-driven sales where the website is incidental.",
      },
      {
        q: "Where do you work?",
        a: "Mostly Germany, Switzerland, Austria, and the United States, with other countries welcome. Everything is delivered remotely; the process runs on evidence and calls, not on-site days. Clients include HockeyStack, Leapsome, Circula, instaffo, and Simplesense.",
      },
      {
        q: "How is it priced?",
        a: "Diagnosis is a fixed price. The Rebuild is scoped from the roadmap Diagnosis produces, so the quote is built on evidence rather than a guess. The retainer is priced per Wave with a minimum of three, because the compounding needs three rounds to show. You’ll have exact numbers after the first call.",
      },
      {
        q: "How do we start?",
        a: "Book a call through the form above. Bring your competitor shortlist and, if you can, your last few lost deals. On the first call we look at whether Diagnosis would produce evidence worth paying for in your situation. If it wouldn’t, we’ll tell you.",
      },
    ],
  },
] as const;

export function FaqSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section
      className={styles.section}
      id="faq"
      aria-labelledby="faq-title"
      data-theme="dark-primary"
      data-section-anim="off"
    >
      <aside className={styles.intro}>
        <div className={styles.introContent}>
          <SectionTag>FAQ</SectionTag>
          <h2 id="faq-title" data-reveal="sweep">You must have a ton of questions.</h2>
          <nav className={styles.anchorLinks} aria-label="FAQ categories">
            {groups.map((group) => (
              <a href={`#${group.id}`} key={group.id}>
                {group.title}
              </a>
            ))}
          </nav>
        </div>
        <PixelHatchButton href="#contact">Contact Us</PixelHatchButton>
      </aside>

      <div className={styles.groups}>
        {groups.map((group) => (
          <section className={styles.group} id={group.id} key={group.id}>
            <h3>{group.title}</h3>
            <div className={styles.items}>
              {group.items.map((item, index) => {
                const itemId = `${group.id}-${index}`;
                const isOpen = openItem === itemId;

                return (
                  <article
                    className={styles.item}
                    data-open={isOpen}
                    data-faq-item={itemId}
                    key={itemId}
                  >
                    <h4>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`${itemId}-answer`}
                        onClick={() => setOpenItem(isOpen ? null : itemId)}
                      >
                        <span>{item.q}</span>
                        <Image
                          src="/assets/faq-arrow-white.svg"
                          alt=""
                          width={35}
                          height={35}
                        />
                      </button>
                    </h4>
                    <div className={styles.answer} id={`${itemId}-answer`} aria-hidden={!isOpen}>
                      <div>
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
