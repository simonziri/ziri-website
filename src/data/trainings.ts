/*
 * Webinar-Lead-Magnets (Landingpages unter /training/[slug]).
 *
 * - `slug` steht in der URL und bleibt neutral/beschreibend.
 * - `id` ist die gesprochene interne Kennung (z. B. für Ads/Absprachen),
 *   taucht nicht in der URL auf.
 * - Copy (outcome, bullets) ist PLATZHALTER, Simon iteriert noch.
 *   Copy-Regeln aus HANDOFF.md gelten: keine Em-Dashes, keine AI-sloppy
 *   Wörter, keine Kundennamen in Titeln/Bullets, keine Ergebnisversprechen.
 * - Alle /training/*-Seiten sind noindex und stehen NICHT in der Sitemap.
 */

/** Platzhalter-Releasedatum, gilt für alle Trainings bis Simon es festlegt. */
export const TRAINING_RELEASE_DATE = "2026-11-12";

export type Training = {
  slug: string;
  /** Gesprochene ID, z. B. "Charlie Two" */
  id: string;
  title: string;
  /** Eine Zeile unter der H1 */
  outcome: string;
  bullets: readonly [string, string, string];
  /** ISO-Datum (YYYY-MM-DD) */
  releaseDate: string;
  image?: { src: string; alt: string; width: number; height: number };
};

export const trainings: readonly Training[] = [
  {
    slug: "relaunch-1000-pages",
    id: "Romeo One",
    title:
      "How to relaunch 1,000+ pages in 6 weeks without losing rankings or conversions.",
    outcome:
      "The plan we used to move 1,000+ pages in 6 weeks, step by step, so you can scope your own relaunch.",
    bullets: [
      "How to sequence a large relaunch so SEO and conversion pages are safe first",
      "The redirect and QA checklist that catches problems before Google does",
      "Where to cut scope when the deadline is fixed",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "reposition-after-product-change",
    id: "Papa One",
    title:
      "Your core product changed, so what now? How to reposition and refresh your 100+ page website in under 6 weeks.",
    outcome:
      "A practical way to bring your positioning and your website up to date with what you actually sell today.",
    bullets: [
      "How to find out which pages still tell the old story",
      "How to rewrite positioning with input from sales and customers",
      "How to roll out the change across 100+ pages without a full rebuild",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "cro-for-high-ticket-b2b",
    id: "Charlie One",
    title:
      "Most CRO advice was written for online shops or low-ticket. How to raise conversions when one deal is worth €10k+.",
    outcome:
      "Why conversion work for €10k+ deals needs different inputs, and how to set it up for your site.",
    bullets: [
      "Which CRO habits from e-commerce mislead B2B teams",
      "What buying committees look for before they book a call",
      "How to measure progress when you only get a few leads a week",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "demo-page-plus-20",
    id: "Charlie Two",
    title:
      "The method behind +20% on a €10k+ ACV demo page, even when you already implemented every landing page best practice.",
    outcome:
      "A walkthrough of the method behind +20% on a €10k+ ACV demo page, so you can apply it to your own.",
    bullets: [
      "Where to look once the usual best practices are already in place",
      "How we decided what to change on the demo page and what to leave",
      "How to run the same process on your highest-intent page",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "big-landing-page-changes",
    id: "Charlie Five",
    title:
      "Button color tests won't move a €10k+ decision. How to make the big landing page changes that do, without flying blind.",
    outcome:
      "How to plan bigger landing page changes and still know whether they worked.",
    bullets: [
      "Which changes are worth testing for €10k+ decisions",
      "How to reduce risk before you ship a bigger change",
      "How to read results when traffic is too low for classic A/B tests",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "conversion-roadmap-from-sales",
    id: "Charlie Ten",
    title:
      "Stop guessing what to test. How to build your conversion roadmap from sales calls, reviews and lost deals.",
    outcome:
      "A repeatable way to turn what buyers already tell you into a ranked list of website changes.",
    bullets: [
      "Where to find buyer objections you already have on record",
      "How to sort them into a roadmap your team can work through",
      "How to keep the roadmap current as new deals come in",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "on-brand-pages-in-90-minutes",
    id: "Victor Two",
    title:
      "How to ship on-brand landing pages in under 90 minutes, without your designer or developer.",
    outcome:
      "The setup that lets marketing build new landing pages that still look like your brand.",
    bullets: [
      "Which building blocks you need before marketing can build alone",
      "A workflow from brief to published page",
      "Guardrails that keep pages on brand without a design review",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "webflow-pages-without-developers",
    id: "Victor Four",
    title:
      "How to let your marketing team build Webflow pages without a developer or designer, even on a 1,000+ page site, without breaking anything.",
    outcome:
      "How to set up a large Webflow site so your marketing team can build pages safely on their own.",
    bullets: [
      "How to structure components and classes for non-developers",
      "Roles, permissions and review steps that prevent broken pages",
      "What to keep with developers, and what to hand over",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
];

export const getTraining = (slug: string) =>
  trainings.find((training) => training.slug === slug);

/** Datum wie "November 12, 2026". UTC, damit es nicht je nach Server-TZ springt. */
export const formatTrainingDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));

/* Qualifizierungsfrage im Training-Formular. */
export const TRAINING_ROLES = [
  { value: "marketing-leader", label: "Marketing leader" },
  { value: "founder-ceo", label: "Founder / CEO" },
  { value: "sales-leader", label: "Sales leader" },
  { value: "other", label: "Other" },
] as const;
