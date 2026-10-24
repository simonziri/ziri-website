import type { Metadata } from "next";
import { UmzugPage } from "./umzug-page";

/*
 * Deutsche Landingpage "Website-Umzug" (Lead-Magnet-Familie). noindex und
 * bewusst NICHT in sitemap.ts. Inhalt + Formular: ./umzug-page.tsx,
 * API: /api/website-umzug, Privacy Policy Abschnitt 4a (#website-umzug).
 */

const TITLE = "Website-Umzug in 72 Stunden, garantiert | ZIRI";
const DESCRIPTION =
  "Wir ziehen deine Marketing-Seite von WordPress, TYPO3 & Co. auf ein modernes System um. Gleiches Design, gleiche Links, Festpreis.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Lead-Magnet-Seiten nie indexieren, unabhängig von der Umgebung
  robots: { index: false, follow: false },
  openGraph: {
    title: "Umzug zu einem modernen System in 72 Stunden garantiert.",
    description: DESCRIPTION,
    locale: "de_DE",
  },
};

export default function WebsiteUmzugPage() {
  return <UmzugPage />;
}
