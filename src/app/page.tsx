import { Hero } from "@/components/hero";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SiteHeader />
        <Hero />
      </div>
    </main>
  );
}
