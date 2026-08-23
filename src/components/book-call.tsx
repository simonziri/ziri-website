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
              “Glad you made it this far. Tell us about the last deal you
              lost, and we’ll take it from there.”
            </h2>
            <p>Simon Ziri, Founder</p>
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
