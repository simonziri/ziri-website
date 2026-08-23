import { BookCall } from "@/components/book-call";
import { CustomerJourney } from "@/components/customer-journey";
import { FaqSection } from "@/components/faq-section";
import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { HeroDots } from "@/components/hero-dots";
import { OurWay } from "@/components/our-way";
import { Paradox } from "@/components/paradox";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Testimonials } from "@/components/testimonials";
import { ThemeScrollShift } from "@/components/theme-scroll";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SiteHeader />
        <div className={styles.dotsScope}>
          <HeroDots />
          <Hero />
          <FeaturedWork />
        </div>
        <Paradox />
        <OurWay />
        <CustomerJourney />
        <Testimonials />
        {/* EngagementTypes vorerst ausgeblendet (Simons Ansage 23.08.) */}
        <ThemeScrollShift />
        <BookCall />
        <FaqSection />
        <SiteFooter />
      </div>
    </main>
  );
}
