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

/** Absenderadresse der Trainings-Mails (beehiiv), steht auf der Danke-Seite. */
/** sessionStorage-Key: Adresse von der Anmeldung an die Thank-you-Seite (nie in der URL). */
export const TRAINING_EMAIL_STORAGE_KEY = "ziri:training:email";

export const TRAINING_SENDER_EMAIL = "simon@mail.simonziri.com";

export type Training = {
  slug: string;
  /** Gesprochene ID, z. B. "Charlie Two" */
  id: string;
  title: string;
  /** Ende von `title`, das in der H1 in Sekundärfarbe steht (muss exakt so am Ende von `title` stehen) */
  titleSecondary?: string;
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
    titleSecondary: "without losing rankings or conversions.",
    outcome:
      "The exact steps we used to relaunch a 1,000+ page website in less than 6 weeks. Plus the risks and decisions you’ll face, and how you can use AI to make impossible timelines possible.",
    bullets: [
      "Where the real risks are and where to be pragmatic",
      "Unique techniques and systems to dramatically save time",
      "How to prioritize pages in a partial relaunch",
      "Which numbers to track before and after launch",
      "Which ranking and conversion signals matter",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "prep-1000-page-relaunch",
    id: "Romeo Two (prep)",
    title: "How to prep for a 1,000+ page website relaunch.",
    outcome:
      "Get a step-by-step prep plan: the decisions to make before you start, the data to pull, and 5 questions to ask any agency. Learn from 7 years of relaunch experience.",
    bullets: [
      "How to decide if you need a relaunch",
      "How to compare CMS",
      "What the 3 relaunch approaches are and which is right for you",
      "What influences timeline and budget the most",
      "How to set goals and define success",
      "How to find the right agency",
      "Which numbers to track before and after relaunching",
      "What mistakes teams make that miss their deadline",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "reposition-after-product-change",
    id: "Papa One",
    title:
      "Your product changed and now your B2B website is confusing prospects?",
    outcome:
      "Get a 5-week plan to reposition and update your website, from research to launch.",
    bullets: [
      "Which data to collect to improve your chances of success",
      "Techniques to grade your new message",
      "How to validate your positioning before launching",
      "How AI describes you today, and where that comes from",
      "Which pages still tell the old story, and what to fix first",
      "If you really need to relaunch your brand and website, or if a refresh is enough",
      "Which signals to watch after launch",
    ],
    releaseDate: TRAINING_RELEASE_DATE,
  },
  {
    slug: "cro-for-high-ticket-b2b",
    id: "Charlie One",
    title:
      "Most CRO advice was written for online shops and low-ticket.",
    outcome:
      "Get the B2B approach to CRO when each deal is worth $10k+ and you see a few leads a week: research, big changes you can measure, and how to read the results.",
    bullets: [
      "Why the CRO you know doesn't work for high-ticket B2B",
      "How to win in long sales cycles using your website",
      "How to use research and messaging to pick changes worth making",
      "How to run impactful tests that you can validate",
      "How to work with data when traffic and conversions are low",
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
      "Get my 2 favorite approaches to build on-brand landing pages in under 90 minutes, without waiting on design or development. Learn from 7 years of experience.",
    bullets: [
      "What humans and AI need before marketing can build alone",
      "Which safeguards to put into place",
      "Which of the 2 approaches fits your team",
      "How to use generative design without losing brand consistency",
      "Which avoidable mistakes add days of design and dev time",
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

/*
 * Qualifizierungsfrage im Training-Formular (Firmentyp, seit 22.10.).
 * Feldname bleibt intern "role" (beehiiv-Custom-Field, API), damit nichts
 * umgebaut werden muss.
 */
export const TRAINING_ROLES = [
  { value: "b2b-tech", label: "B2B Tech" },
  { value: "b2b-services", label: "B2B Services" },
  { value: "agency", label: "Agency" },
  { value: "fractional-cmo", label: "Fractional CMO" },
  { value: "other", label: "Other" },
] as const;

/**
 * Antworten, die NICHT als qualified_lead an Meta gehen (Simons Ansage
 * 22.10.: nur Agenturen ausschließen). generate_lead feuert weiter für alle.
 */
export const TRAINING_UNQUALIFIED_ROLES: readonly string[] = ["agency"];
