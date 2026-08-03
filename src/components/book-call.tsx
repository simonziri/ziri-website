import Image from "next/image";
import styles from "./book-call.module.css";

export function BookCall() {
  return (
    <section className={styles.section} id="contact" aria-labelledby="book-call-title">
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
            <h2 id="book-call-title">
              “We’re stoked to have you here. If you’re ready to chat, please fill
              out the form below.”
            </h2>
            <p>Simon Ziri, Founder</p>
          </div>
        </header>

        <div className={styles.embed} role="region" aria-label="Book a call form">
          <span className={styles.srOnly}>Scheduling form will appear here.</span>
        </div>
      </div>
    </section>
  );
}
