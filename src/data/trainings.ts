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
  /** Eine Zeile unter der H1 (optional, z. B. wenn die H1 schon alles sagt) */
  outcome?: string;
  bullets: readonly string[];
  /** ISO-Datum (YYYY-MM-DD) */
  releaseDate: string;
  image?: { src: string; alt: string; width: number; height: number };
};

export const trainings: readonly Training[] = [
  {
    slug: "relaunch-1000-pages",
    id: "Romeo One",
    title:
      "How to relaunch your 1,000+ page website in 6 weeks without losing rankings or conversions.",
    bullets: [
      "How to choose the right contractor for a relaunch this size",
      "How to define success before the project starts",
      "How to monitor success during and after the launch",
      "What to prioritize, and what to push to after the launch",
      "What to systemize, plus the tricks that save the most time",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "prep-1000-page-relaunch",
    id: "Romeo Two (prep)",
    title: "How to prep for a 1,000+ page website relaunch.",
    outcome:
      "Learn what it takes to relaunch in under 6 weeks without tanking your rankings or conversion rates.",
    bullets: [
      "Where the big risks in a 1,000+ page relaunch are",
      "What data you need before you start",
      "The mistakes to avoid, and what they cost if you don't",
      "The decisions that speed up the whole process",
      "How to think about systemizing: what you can repeat and template",
      "How to prioritize pages clearly, so the important ones come first",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "reposition-after-product-change",
    id: "Papa One",
    title:
      "Your product changed and now your B2B website is confusing prospects?",
    outcome:
      "Learn how to fix your positioning and website in 4–⁠5 weeks.",
    bullets: [
      "How to find out which pages still tell the old story",
      "How to rewrite and validate positioning with input from sales and customers",
      "A 4–5 week plan: 2 weeks of positioning, then the website refresh",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "cro-for-high-ticket-b2b",
    id: "Charlie One",
    title:
      "Most CRO advice was written for online shops and low-ticket.",
    outcome:
      "Learn how to raise conversions when each deal is worth $10k+ and volume is low.",
    bullets: [
      "Why high-ticket sales cycles, and their sales pages, work fundamentally differently",
      "Which CRO habits from e-commerce mislead B2B teams",
      "What buying committees look for before they book a call",
      "How to validate success when you only get a few leads a week",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "demo-page-plus-20",
    id: "Charlie Two",
    title:
      "The method behind +20% on a $10k+ deal value demo page, even when you already implemented every landing page best practice.",
    outcome:
      "A walkthrough of the method behind +20% on a $10k+ deal value demo page, so you can apply it to your own.",
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
      "Button color tests won't move a $10k+ decision. How to make the big landing page changes that do, without flying blind.",
    outcome:
      "How to plan bigger landing page changes and still know whether they worked.",
    bullets: [
      "Which changes are worth testing for $10k+ decisions",
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
    slug: "landing-pages-in-a-day",
    id: "Victor Two (day)",
    title:
      "Your next SaaS landing page shouldn’t take a week.",
    outcome:
      "Learn how in-house marketers build pages in under 90 minutes. On brand and without waiting on design or development.",
    bullets: [
      "What needs to happen before marketing can build alone",
      "A workflow from brief to published page in under 90 minutes",
      "Guardrails that keep pages on brand without a design review",
      "The tools fast-growing companies use to launch pages faster than anyone else",
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
  { value: "agency-freelancer", label: "Agency / freelancer" },
  { value: "other", label: "Other" },
] as const;
