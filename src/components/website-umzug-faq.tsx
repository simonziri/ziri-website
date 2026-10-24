"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./faq-section.module.css";

type FaqItem = { q: string; a: string };

/* Akkordeon im Stil der Startseiten-FAQ (gleiche Item-Styles), für dunkle Sektionen. */
export function WebsiteUmzugFaq({ items }: { items: readonly FaqItem[] }) {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <div className={styles.items}>
      {items.map((item, index) => {
        const isOpen = openItem === index;
        const itemId = `umzug-faq-${index}`;
        return (
          <article className={styles.item} data-open={isOpen} key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${itemId}-answer`}
                onClick={() => setOpenItem(isOpen ? null : index)}
              >
                <span>{item.q}</span>
                <Image
                  src="/assets/faq-arrow-white.svg"
                  alt=""
                  width={35}
                  height={35}
                />
              </button>
            </h3>
            <div
              className={styles.answer}
              id={`${itemId}-answer`}
              aria-hidden={!isOpen}
            >
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
