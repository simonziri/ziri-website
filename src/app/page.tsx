import { BookCall } from "@/components/book-call";
import { CustomerJourney } from "@/components/customer-journey";
import { EngagementTypes } from "@/components/engagement-types";
import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { OurWay } from "@/components/our-way";
import { Paradox } from "@/components/paradox";
import { SiteHeader } from "@/components/site-header";
import { Testimonials } from "@/components/testimonials";
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
        <CustomerJourney />
        <Testimonials />
        <EngagementTypes />
        <BookCall />
      </div>
    </main>
  );
}
