import styles from "./section-tag.module.css";

export function SectionTag({ children }: { children: string }) {
  return (
    <div className={styles.tag} data-reveal="wipe">
      <span className={styles.motif} aria-hidden="true">
        <i className={styles.gold} />
        <i className={styles.coral} />
        <i className={styles.purple} />
      </span>
      <span>{children}</span>
    </div>
  );
}
