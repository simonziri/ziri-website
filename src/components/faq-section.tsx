"use client";

import Image from "next/image";
import { useState } from "react";
import { PixelHatchButton } from "./pixel-hatch-button";
import { SectionTag } from "./section-tag";
import styles from "./faq-section.module.css";

const groups = [
  { id: "faq-about", title: "About ZIRI" },
  { id: "faq-method", title: "How we work with you" },
  { id: "faq-clients", title: "Who we work with" },
] as const;

const questions = Array.from({ length: 5 }, () => "What’s so different about ZIRI?");

export function FaqSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section
      className={styles.section}
      id="faq"
      aria-labelledby="faq-title"
      data-theme="dark-primary"
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
              {questions.map((question, index) => {
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
                        <span>{question}</span>
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
                        <p>
                          ZIRI combines customer research, positioning, messaging and
                          design to build websites for long, complex B2B sales cycles.
                        </p>
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
