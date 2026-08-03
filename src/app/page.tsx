import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { OurWay } from "@/components/our-way";
import { Paradox } from "@/components/paradox";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SiteHeader />
        <Hero />
        <FeaturedWork />
        <Paradox />
        <OurWay />
      </div>
    </main>
  );
}
