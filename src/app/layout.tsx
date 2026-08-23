import type { Metadata } from "next";
import localFont from "next/font/local";
import { RevealObserver } from "@/components/reveal-observer";
import "./globals.css";

const stackSans = localFont({
  src: "../../StackSansText-VariableFont_wght.woff2",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  variable: "--font-stack-sans",
  weight: "100 900",
});

const SITE_URL = "https://simonziri.com";
const SITE_DESCRIPTION =
  "We build your website on why buyers choose you, and why they don't. " +
  "Buyer research and clear differentiation for B2B companies selling " +
  "five to seven figure deals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ZIRI | B2B Websites Built on Buyer Research",
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ZIRI",
    locale: "en_US",
    title: "ZIRI | B2B Websites Built on Buyer Research",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIRI | B2B Websites Built on Buyer Research",
    description: SITE_DESCRIPTION,
  },
};

/* Strukturierte Daten: Agentur + Website. Inhalte spiegeln die Site
   (Hero, FAQ „Wo arbeitet ihr?", Cases) — bei Copy-Änderungen mitziehen. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: "ZIRI",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      slogan: "We build your website on why buyers choose you, and why they don't.",
      founder: {
        "@type": "Person",
        name: "Simon Ziri",
        sameAs: ["https://www.linkedin.com/in/simonziri/"],
      },
      sameAs: ["https://www.linkedin.com/in/simonziri/"],
      areaServed: ["Germany", "Switzerland", "Austria", "United States"],
      knowsAbout: [
        "B2B website design",
        "Buyer research",
        "Messaging and positioning",
        "Conversion optimization",
        "Brand design",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "ZIRI",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html className={stackSans.variable} lang="en" data-theme="light-primary">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RevealObserver />
        {children}
        {modal}
      </body>
    </html>
  );
}
