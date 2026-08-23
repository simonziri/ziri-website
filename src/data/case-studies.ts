/*
 * Case study content model.
 *
 * Structured to map 1:1 onto a CMS collection later (Sanity):
 * every field below becomes a document field, `gallery` becomes an
 * array of typed blocks. Keep components dumb — they only read this shape.
 *
 * Images carry their intrinsic width/height so the markup can declare
 * dimensions and avoid layout shift; they render at full container
 * width with their natural aspect ratio.
 */

export type CaseStudyKpi = {
  value: string;
  label: string;
};

export type CaseStudyImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** One row in the project gallery. `full` = single full-width image;
 *  `bento` = images side by side, column widths follow aspect ratios
 *  so all images in the row share the same rendered height. */
export type GalleryRow =
  | { layout: "full"; image: CaseStudyImage }
  | { layout: "bento"; images: CaseStudyImage[] };

export type CaseStudyTestimonial = {
  quote: string[];
  name: string;
  role: string;
  avatar?: string;
};

export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  /** One-line subline under the title. */
  sub: string;
  /** Intro paragraph; also used for <meta name="description">. */
  summary: string;
  logo?: string;
  /** Small print (e.g. "Commissioned by …", partnership credits). */
  note?: string;
  /** Card/preview image used by listings — delivered later. */
  thumbnail?: CaseStudyImage;
  /** Optional 1:1 video embed next to the headline. */
  video?: { url?: string; poster?: string };
  /** Optional; band is hidden when absent. */
  kpis?: CaseStudyKpi[];
  gallery: GalleryRow[];
  testimonial?: CaseStudyTestimonial;
  /** Draft cases render at their URL but are excluded from
   *  listings, next-links and generateStaticParams. */
  draft?: boolean;
};

const img = (
  src: string,
  alt: string,
  width: number,
  height: number,
): CaseStudyImage => ({ src: `/assets/case-studies/${src}`, alt, width, height });

export const caseStudies: CaseStudy[] = [
  {
    slug: "circula",
    client: "Circula",
    title: "Rebrand & Website Relaunch for Circula",
    sub: "A complete redesign and 500+ page migration to help Circula look like the market leader.",
    summary:
      "Circula had outgrown its website: a fast-scaling expense platform that still looked like an early-stage startup, in a category full of interchangeable fintech design. We supported the brand redesign alongside their internal team, redesigned the website, and migrated 500+ pages across two languages without losing rankings, then trained the team to build and edit pages themselves. The result got featured three times.",
    note: "In partnership with Luca Gonzalez Sonst and Christian Schmitt.",
    logo: "/assets/tab-logos/Circula.svg",
    thumbnail: {
      src: "/assets/featured/project-image-1.avif",
      alt: "Circula website redesign",
      width: 1412,
      height: 1412,
    },
    kpis: [
      { value: "500+", label: "pages migrated" },
      { value: "2", label: "languages" },
      { value: "3×", label: "featured" },
    ],
    gallery: [
      {
        layout: "bento",
        images: [
          img("circulabentoleft.avif", "Circula website detail", 1662, 963),
          img("circulabentoright.avif", "Circula mobile view", 834, 963),
        ],
      },
      { layout: "full", image: img("circulabottom.avif", "The relaunched Circula website", 2544, 1833) },
    ],
  },
  {
    slug: "simplesense",
    client: "simplesense",
    title: "Rebrand, Visual Language & Website Relaunch for simplesense",
    sub: "A full rebrand and relaunch that make complex data infrastructure instantly understandable.",
    summary:
      "simplesense connects systems that don't talk to each other, and their old site shared the category's problem: complexity nobody could parse quickly. We rebuilt the brand from the ground up, defined the visual direction for their platform, designed a visual language built from their core story, and relaunched the website, extended since into case study and whitepaper designs.",
    note: "In partnership with TRU VM and Marie Wilda.",
    logo: "/assets/tab-logos/Simplesense.svg",
    thumbnail: {
      src: "/assets/featured/project-image-2.avif",
      alt: "simplesense website redesign",
      width: 1412,
      height: 1412,
    },
    gallery: [
      { layout: "full", image: img("simplesensetop.avif", "simplesense rebrand", 2517, 1833) },
      { layout: "full", image: img("simplesensebottom.avif", "simplesense visual language", 2517, 963) },
    ],
    testimonial: {
      quote: [
        "“They rapidly got up to speed on our problem and solution set and cut through the complexity to create a design that cleanly tells our story to an outside audience.”",
      ],
      name: "Eric Kanagy",
      role: "CEO & Founder, simplesense",
      avatar: "/assets/eric-kanagy.png",
    },
  },
  {
    slug: "leapsome",
    client: "Leapsome",
    title: "Website System & Conversion Program for Leapsome",
    sub: "From technical debt to a self-serve website the marketing team runs on its own.",
    summary:
      "Over 1.5+ years as a retainer partner, we cleaned up a huge grown website, removed developer dependency, and cut the time to launch new pages by 90%. The team has since shipped 15+ product pages on their own. On top, we run a research- and messaging-focused conversion program on their highest-leverage pages.",
    logo: "/assets/tab-logos/Leapsome.svg",
    thumbnail: {
      src: "/assets/featured/leapsome-thumb.avif",
      alt: "Leapsome website system",
      width: 1544,
      height: 1544,
    },
    kpis: [
      { value: "90%", label: "less time to launch a page" },
      { value: "15+", label: "pages shipped by the team" },
      { value: "1.5+ yrs", label: "retainer partnership" },
    ],
    gallery: [
      { layout: "full", image: img("leapsomebottom.avif", "Leapsome website system", 2517, 1821) },
      { layout: "full", image: img("leapsomecenter.avif", "Leapsome page templates", 2517, 963) },
    ],
  },
  {
    slug: "hockeystack",
    client: "HockeyStack",
    title: "Visual Refresh & Homepage Redesign for HockeyStack",
    sub: "A sharper visual language and rebuilt homepage for the revenue analytics platform.",
    summary:
      "We revamped HockeyStack's colors, typography, and visual language, then redesigned and redeveloped the homepage to match where the product had grown. Along the way, we fixed a broken proxy affecting 100+ pages, protecting hard-earned SEO rankings.",
    note: "Commissioned by Quarter Digital.",
    logo: "/assets/tab-logos/HockeyStack.svg",
    thumbnail: {
      src: "/assets/featured/hockeystack-thumb.avif",
      alt: "HockeyStack homepage redesign",
      width: 1544,
      height: 1544,
    },
    kpis: [{ value: "100+", label: "pages with rankings protected" }],
    gallery: [
      { layout: "full", image: img("hockeystacktop.avif", "HockeyStack homepage redesign", 2517, 1833) },
      { layout: "full", image: img("hockeystackbottom.avif", "HockeyStack visual language", 2517, 963) },
    ],
  },
  {
    slug: "instaffo",
    client: "Instaffo",
    title: "B2B Area Expansion for Instaffo",
    sub: "We expanded Instaffo's B2B area, with a design system their team now runs.",
    summary:
      "Instaffo's B2B story lived in the shadow of its B2C brand. We designed and developed the expanded B2B area, built a design system that keeps everything consistent, and trained their team to develop the site further on their own, which they do.",
    logo: "/assets/tab-logos/Instaffo.svg",
    thumbnail: {
      src: "/assets/featured/instaffo-thumb.avif",
      alt: "Instaffo B2B area",
      width: 1544,
      height: 1544,
    },
    gallery: [
      { layout: "full", image: img("instaffotop.avif", "Instaffo B2B area", 2517, 963) },
      { layout: "full", image: img("instaffocenter.avif", "Instaffo design system", 2517, 1833) },
      { layout: "full", image: img("instaffobottom.avif", "Instaffo B2B pages", 2736, 1221) },
    ],
  },

  /* ——— Vorgelagert: Inhalte stehen, Bilder folgen (draft) ——— */
  {
    slug: "scalera",
    client: "Scalera",
    title: "Rebrand & Website for Scalera",
    sub: "A complete rebrand and new website that make complex AI software instantly clear.",
    summary:
      "Scalera's AI tendering platform is powerful and hard to explain, exactly the combination that loses deals. We rebranded Scalera completely and built the full website (DE/EN), sharpened how the software is communicated, and coached the internal team on writing copy that stays clear as they grow.",
    gallery: [],
    draft: true,
  },
  {
    slug: "notus",
    client: "Notus",
    title: "Brand, Website & Positioning for Notus",
    sub: "A new look for the personal branding agency: strategy through development, one team.",
    summary:
      "For Notus, we handled strategy, design, and development in one motion, giving the personal branding agency a website that finally looks like the work they sell.",
    gallery: [],
    draft: true,
  },
  {
    slug: "ideabay",
    client: "ideabay",
    title: "Rebrand, Messaging & Website for ideabay",
    sub: "New positioning, new copy, new website. Everything but the logo.",
    summary:
      "For ideabay, we looked at why deals were won and lost, who their best customers are, and rebuilt the messaging around them. On that basis we rewrote the entire copy, redesigned the brand (keeping the logo), and built the new website for their AI CX solutions.",
    gallery: [],
    draft: true,
  },
  {
    slug: "analyst-house",
    client: "[Analyst House]",
    title: "Homepage & Messaging for [Name]",
    sub: "A messaging-first homepage update built on why they win and lose deals.",
    summary:
      "Half of this project was messaging work: we analyzed why deals were lost and won, identified their best customers, set priorities, and aligned the entire messaging around them. On that basis, we upgraded their existing brand design and updated the homepage to carry the new story.",
    gallery: [],
    draft: true,
  },
  {
    slug: "spark",
    client: "SPARK",
    title: "Rebrand, Messaging & Website Relaunch for SPARK",
    sub: "Messaging built on real deal data, carried into a new brand and full relaunch.",
    summary:
      "Like every project, this started with why deals were won and lost and who the best customers are. For SPARK, the answer called for more than messaging: we redid the branding and relaunched the complete website so the sharpened story shows up everywhere a buyer looks.",
    gallery: [],
    draft: true,
  },
];

export const listedCaseStudies = caseStudies.filter((entry) => !entry.draft);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((entry) => entry.slug === slug);
}

export function getNextCaseStudy(slug: string): CaseStudy | undefined {
  const index = listedCaseStudies.findIndex((entry) => entry.slug === slug);
  if (index === -1) return undefined;
  return listedCaseStudies[(index + 1) % listedCaseStudies.length];
}
