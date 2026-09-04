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
const SITE_TITLE = "ZIRI | B2B Websites Built on Market and Sales Intel";
const SITE_DESCRIPTION =
  "Pretty websites don't win large deals. ZIRI digs into your market, " +
  "customer journey and sales intel to build the brand and website that " +
  "make you the obvious choice for the buyers you want most.";

/* Brand-Suchvarianten: unsichtbar (JSON-LD + keywords), damit ZIRI unter
   diesen Schreibweisen gefunden wird. */
const BRAND_ALIASES = [
  "ZIRI Agency",
  "ZIRI GmbH",
  "ZIRI Website",
  "ZIRI Webdesign",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: ["ZIRI", ...BRAND_ALIASES, "Simon Ziri", "B2B web agency"],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ZIRI",
    locale: "en_US",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

/* Strukturierte Daten: Agentur + Website. Inhalte spiegeln die Site
   (Hero, FAQ „Wo arbeitet ihr?", Cases) und die Legal-Seiten (ZIRI GmbH,
   Renningen — lt. Privacy Policy) — bei Copy-Änderungen mitziehen. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: "ZIRI",
      legalName: "ZIRI GmbH",
      vatID: "DE463152518",
      alternateName: BRAND_ALIASES,
      url: SITE_URL,
      email: "simon@simonziri.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Germanenweg 49",
        postalCode: "71272",
        addressLocality: "Renningen",
        addressCountry: "DE",
      },
      description: SITE_DESCRIPTION,
      slogan: "Pretty websites don't win large deals.",
      founder: {
        "@type": "Person",
        name: "Simon Ziri",
        alternateName: "Simon Merkt",
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
