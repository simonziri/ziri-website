import Image from "next/image";
import { ContactForm } from "./contact-form";
import styles from "./book-call.module.css";

export function BookCall() {
  return (
    // Kein eigenes data-theme: die Section startet light und flippt
    // zusammen mit der ganzen Seite (theme-scroll.tsx) auf dark
    <section
      className={styles.section}
      id="contact"
      aria-labelledby="book-call-title"
      data-section-anim="off"
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <Image
            className={styles.avatar}
            src="/assets/simon-ziri.jpg"
            alt="Simon Ziri"
            width={102}
            height={102}
            sizes="102px"
          />
          <div>
            <h2 id="book-call-title" data-reveal="sweep">
              “We take on a limited number of engagements and start every one
              with research. These questions tell us whether we’re the right
              fit and give us a head start before your first call.”
            </h2>
          </div>
        </header>

        <div
          className={styles.embed}
          role="region"
          aria-label="Contact form"
          data-theme="light-primary"
        >
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
