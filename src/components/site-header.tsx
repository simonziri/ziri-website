import Image from "next/image";
import Link from "next/link";
import styles from "./home-sections.module.css";

const navigation = [
  { label: "Testimonials", href: "#testimonials" },
  { label: "Services", href: "#services" },
  { label: "About us", href: "#about" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} href="/" aria-label="ZIRI home">
        <Image
          src="/assets/ziri-logo.svg"
          alt="ZIRI"
          width={77}
          height={30}
          priority
        />
      </Link>

      <nav className={styles.navigation} aria-label="Primary navigation">
        <div className={styles.navigationLinks}>
          {navigation.map((item) => (
            <Link className={styles.navigationLink} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <Link className={styles.headerCta} href="#contact">
          Work with us
        </Link>
      </nav>
    </header>
  );
}
