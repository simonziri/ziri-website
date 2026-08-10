import Image from "next/image";
import styles from "./home-sections.module.css";

const logos = [
  {
    name: "HockeyStack",
    content: (
      <Image src="/assets/tab-logos/HockeyStack.svg" alt="HockeyStack" width={262} height={58} />
    ),
  },
  {
    name: "Leapsome",
    content: (
      <Image
        src="/assets/tab-logos/Leapsome.svg"
        alt="Leapsome"
        width={262}
        height={58}
      />
    ),
  },
  {
    name: "Circula",
    content: (
      <Image
        src="/assets/tab-logos/Circula.svg"
        alt="Circula"
        width={262}
        height={58}
      />
    ),
  },
  {
    name: "Instaffo",
    content: (
      <Image
        src="/assets/tab-logos/Instaffo.svg"
        alt="Instaffo"
        width={262}
        height={58}
      />
    ),
  },
] as const;

export function MobileLogoWall() {
  return (
    <div
      className={styles.mobileLogoWall}
      aria-label="Selected ZIRI clients"
    >
      <div className={styles.mobileLogoCollection}>
        <div className={styles.mobileLogoList} data-logo-wall-list="">
          {logos.map((logo) => (
            <div className={styles.mobileLogoItem} data-logo-wall-item="" key={logo.name}>
              <div className={styles.mobileLogoSlot} data-logo-wall-target-parent="">
                <span className={styles.mobileLogoBefore} aria-hidden="true" />
                <span className={styles.mobileLogoTarget} data-logo-wall-target="">
                  {logo.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
