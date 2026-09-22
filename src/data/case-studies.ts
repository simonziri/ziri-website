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

/** Long-form body block: mono label (optional) + heading + paragraphs.
 *  Paragraphs may contain markdown-style links `[text](url)`. */
export type CaseStudySection = {
  label?: string;
  heading: string;
  paragraphs: string[];
};

export type CaseStudyTestimonial = {
  quote: string[];
  name: string;
  role: string;
  avatar?: string;
};

/** Search snippet overrides. `title` replaces the "<Client> Case Study | ZIRI"
 *  default, `description` replaces the summary in <meta name="description">
 *  and Open Graph. Keep title ≤ 60 and description ≤ 155 characters. */
export type CaseStudySeo = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type CaseStudy = {
  slug: string;
  client: string;
  /** Client website; feeds the Article JSON-LD `about` entity. */
  clientUrl?: string;
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
  seo?: CaseStudySeo;
  /** Optional; band is hidden when absent. */
  kpis?: CaseStudyKpi[];
  gallery: GalleryRow[];
  /** Optional body sections; rendered after the full gallery
   *  (and testimonial), before the next-case link. */
  sections?: CaseStudySection[];
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
    slug: "leapsome",
    client: "Leapsome",
    clientUrl: "https://www.leapsome.com",
    title: "Highlights from 1.5 years of partnership with Leapsome",
    sub: "Over 1.5 years as Leapsome's web agency: strategy, messaging and positioning, web design, development, conversion optimization and team enablement.",
    seo: {
      title: "Leapsome Website Relaunch & Redesign | ZIRI, B2B Web Agency",
      description:
        "ZIRI, B2B web agency, on the Leapsome website relaunch: 5,500 pages redesigned and migrated in five weeks, plus a visual generator and a conversion program.",
      keywords: [
        "Leapsome web agency",
        "Leapsome web design",
        "Leapsome website relaunch",
        "Leapsome website redesign",
      ],
    },
    summary:
      "Leapsome sells HR software to companies where a buying decision runs through HR, finance, IT and the exec team. Deals take months. We have been their website partner for over 1.5 years, across strategy, messaging and positioning, design, development, conversion optimization and team enablement. What follows is a collection of highlights from that time, from the ongoing retainer work to the full relaunch.",
    logo: "/assets/tab-logos/Leapsome.svg",
    thumbnail: {
      src: "/assets/featured/leapsome-thumb-hris.avif",
      alt: "Leapsome website redesign: the relaunched HRIS product page",
      width: 2880,
      height: 3046,
    },
    kpis: [
      { value: "20+", label: "landing pages shipped by the marketing team without us" },
      { value: "200+", label: "product visuals from one source of truth, about 200 hours saved" },
      { value: "5,500", label: "pages migrated and relaunched in 5 weeks, in English and German" },
    ],
    gallery: [
      {
        layout: "bento",
        images: [
          img("leapsomebentoleft.avif", "Leapsome website relaunch: the redesigned homepage", 1395, 837),
          img("leapsomebentoright.avif", "Leapsome product visual from the custom generator", 1128, 837),
        ],
      },
      { layout: "full", image: img("leapsomebottom-v2.avif", "Leapsome website redesign: pages in the dark theme", 2544, 1236) },
    ],
    sections: [
      {
        label: "Highlight 1",
        heading: "A conversion program built on sales intel, not opinions",
        paragraphs: [
          "This runs as part of the retainer, separate from the relaunch. Leapsome's leads are worth a lot. Volume on the pages that matter is therefore low, and small changes take weeks to read. That rules out the usual approach of testing button colors and hoping.",
          "We picked the pages closest to revenue and worked backwards from what sales hears on calls: which objections come up, which competitor gets named, what makes a buyer book a demo and then not show up. Each test carried a written hypothesis before it went live.",
          "The demo page was the first target. It is the page where interest becomes a meeting, so every point of lift there shows up in pipeline.",
          "At Leapsome's deal size a few conversions move the percentage, so we treat every result as directional and let the program compound over several rounds rather than declaring victory on one test.",
        ],
      },
      {
        label: "Highlight 2",
        heading: "The Leapsome website relaunch, 290 pages in five weeks",
        paragraphs: [
          "Leapsome decided to rebuild the site on a new design and messaging. Design prep took two weeks, the build took three, and then [www.leapsome.com](https://www.leapsome.com) switched to the new site. Five weeks from first asset to live.",
          "The size of it: 166 static pages, 45 CMS collections with their own templates, and roughly 5,500 URLs Google already indexes, all of it in English and German. Organic search is one of Leapsome's main growth drivers, so the risk sat in the migration, not the design. A relaunch that drops rankings costs more than it earns, and the old site had to keep running untouched until the switch.",
          "We built the new site through the newest capabilities of the Webflow MCP. Pages, components, properties, copy and CMS items were written through the API, with the Designer reserved for the few things the API cannot reach. Where no tool existed, we built one, like the visual generator described below. Before cut-over, we ran a migration check that requested every indexed URL against the new site. Result: every URL answered or redirected to the same target as before, every SEO title and description survived, and the template-level regressions the sweep caught, like two CMS templates that had lost their H1 across more than 100 pages, were fixed before DNS moved.",
        ],
      },
      {
        label: "Highlight 3",
        heading: "A custom visual generator",
        paragraphs: [
          "The new design needed product visuals on nearly every page, and Leapsome's product changes faster than a screenshot library can keep up. So we built a generator that turns a written brief into finished, on-brand UI visuals of the product. More than 200 visuals came out of it for the relaunch alone, which took roughly 200 hours off the project.",
          "It changes who can make visuals. A marketer who needs a hero image for a landing page describes what it should show and gets it, in the right style, without a design ticket. Designers use the output as a base and export SVG to refine it, so they start from something instead of from a blank canvas. And because every visual is built from the same source of truth, the product looks the same on every page, which it never does when screenshots pile up over two years.",
          "The generator also produces animated and interactive visuals, close to click-through demos, so a page can show the product working instead of a still frame of it.",
        ],
      },
      {
        label: "Highlight 4",
        heading: "Enabling the team",
        paragraphs: [
          "The setup is component first. Every section the marketing team touches is a reusable block with clear settings, sitting on one design system: shared tokens, three theme modes, and typography and spacing that match the Figma source one to one. A section switches theme by dropping in a single component. Per-page variation happens through properties, not through new classes.",
          "We paired that with 1:1 sessions and a video library, so the team learned the system on their own pages rather than from documentation.",
          "The effect shows in what they ship. The team has built more than 20 landing pages without our help since. That moved our collaboration away from execution and towards the strategic layers: which pages to build, what they should say, and how to test them. Instead of being the bottleneck, we raised the ceiling.",
        ],
      },
      {
        label: "Highlight 5",
        heading: "Clearing the technical debt",
        paragraphs: [
          "When we started, the Leapsome site had years of growth baked in. Hundreds of pages, thousands of classes, and every new page needed a developer. Marketing had ideas faster than the site could take them.",
          "Dead classes went, page templates got a shared structure, and the pieces marketing touches most became reusable blocks. The measure we cared about was how long it takes a marketer to get a new page live without asking anyone. That time dropped by around 90%.",
          "This groundwork made everything above possible. You cannot run tests on a site nobody dares to touch, and you cannot relaunch in five weeks on a codebase you do not understand.",
        ],
      },
    ],
  },
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
    client: "Simplesense",
    title: "Rebrand, Visual Language & Website Relaunch for Simplesense",
    sub: "A full rebrand and relaunch that make complex data infrastructure instantly understandable.",
    summary:
      "Simplesense connects systems that don't talk to each other, and their old site shared the category's problem: complexity nobody could parse quickly. We rebuilt the brand from the ground up, turned that core story into a visual language that carries through the platform, and relaunched the website. The same system has since extended into their case studies and whitepapers.",
    note: "In partnership with TRU VM and Marie Wilda.",
    logo: "/assets/tab-logos/Simplesense.svg",
    thumbnail: {
      src: "/assets/featured/project-image-2.avif",
      alt: "Simplesense website redesign",
      width: 1412,
      height: 1412,
    },
    gallery: [
      { layout: "full", image: img("simplesensetop.avif", "Simplesense rebrand", 2517, 1833) },
      { layout: "full", image: img("simplesensebottom.avif", "Simplesense visual language", 2517, 963) },
      { layout: "full", image: img("simplesensedashboards.avif", "Simplesense dashboards: operator view in mission-ready and degraded state, and the command view", 3588, 1222) },
    ],
    testimonial: {
      quote: [
        "“They rapidly got up to speed on our problem and solution set and cut through the complexity to create a design that cleanly tells our story to an outside audience.”",
      ],
      name: "Eric Kanagy",
      role: "CEO & Founder, Simplesense",
      avatar: "/assets/eric-kanagy.png",
    },
    sections: [
      {
        label: "The brief",
        heading: "Out of the defense-tech corner",
        paragraphs: [
          "Simplesense gives the people who run military installations one view of the infrastructure underneath their mission: power, water, security, communications, all of it on separate, aging systems that were never built to talk to each other. The category they sell into has a look. Dark mode, full-screen video, threat language, technology first. Simplesense wanted a white, quiet site that makes a complex product simple to grasp, and a company that is visibly about people. Their own line for it is Mission First, People Always.",
          "The messaging strategy came from Marie Wilda and runs on one thread: visibility enables awareness, awareness enables action, action reduces downtime. Simplesense had reached us through TRU VM, a marketing agency we have worked with since our early days. Our part was the brand, the visual language and the website itself.",
        ],
      },
      {
        label: "The process",
        heading: "Building on research that already existed",
        paragraphs: [
          "Simplesense came in with the research done. They had interviewed their customers, written a white paper on the problem and worked out positioning and messaging with Marie. Repeating that work would have cost weeks and told us little new, so we built on it. The first step was an async design exercise: the team annotated a set of reference sites with stickers and comments and named the associations they wanted to own and the ones they wanted to avoid.",
          "Then we went into a workshop with Simplesense's leadership, Marie and TRU VM, traded ideas and challenged them, and came out with a short list of priorities. Order from chaos, above everything. Make it obvious within seconds what the product does and which problems it solves, because a site that feels clever and explains nothing was the failure they feared most. Show that the product is operational and ready to scale, on a site that reads as a software company and never as a consultancy. And keep the people in it: the dispatchers, facility operators and commanders the product exists for. We also settled who the site is for: one buyer, the leaders of installations and their supporting infrastructure, with other markets deliberately left for later.",
          "From there the work ran in iterations. Explorations, applied to real pages, checked in async, narrowed each round. Each round went back to the team as a single direction built on what the workshop had produced, and the only question was whether it was right yet. It got closer every round.",
        ],
      },
      {
        label: "The constraint",
        heading: "Why the simple design is the harder one",
        paragraphs: [
          "A rich design is forgiving. Gradients, shadows, patterns and background effects carry a lot of weight, and they hide a lot too. Take them away and three things are left: typography, a strong form language and the visuals. Typography could only do so much here. The copy is long and editorial, so the oversized display type that makes minimal sites look striking was off the table. The audience has no patience for a design that shows off, so restraint was a requirement. And the background stayed white, because dark mode is the category default.",
          "So the time that would normally go into effects went into two things. The product itself, with the dashboard high on the page as the clearest possible answer to what Simplesense does. And the visual language, which carries the how.",
        ],
      },
      {
        label: "The dashboards",
        heading: "The product, redesigned from the ground up",
        paragraphs: [
          "The dashboard is the clearest answer to what Simplesense does, so it had to look like the brand. We redesigned it from the ground up: an operator view and a command view, on the same white ground and with the same restraint as the site. Color does the work. Green means mission ready, terracotta means degraded and action required, and every element on the screen reads that state at a glance.",
          "The task was to set the visual direction. Simplesense's team builds the detailed dashboards, closer to real use, on that foundation, and they match the site in style and look without depending on us.",
          "Clean visuals are a core part of how we work. Going deep once, into a proper source of truth for the product, makes every visual that follows better and faster, on the website and in everything that comes after it.",
        ],
      },
      {
        label: "The visual language",
        heading: "Three shapes that cannot talk to each other",
        paragraphs: [
          "Simplesense connects systems in infrastructure that were never built to communicate. That became the whole language. Every visual starts from three forms, a square, a triangle and a circle, standing in for the systems and the people that have to work together on an installation: leaders, incident response, facility operators. The circle is the green dot from the Simplesense logo, the one element of the old brand everyone wanted to keep. At the start of each visual the shapes sit apart. Then they connect, and the picture comes together. That movement, from scattered forms to one clear image, is the Simplesense effect, and it is the sentence the brand runs on: turn complexity into clarity.",
          "The rules are deliberately loose. A tighter system would have limited what the images can do. What we cared about is that every visual, on every page, tells the same story.",
        ],
      },
      {
        label: "The imagery",
        heading: "Accurate, good-looking, or abstract",
        paragraphs: [
          "Imagery is a familiar problem in the defense and infrastructure space. Pictures have to be accurate, because the audience lives in these facilities and spots a wrong detail immediately. They also have to look good, and real infrastructure is cables, racks and clutter. Photos of actual users are off limits in this world, and stock photography was ruled out early. Sites in the category tend to settle for accurate and pay for it with pages that look like a server room. We went abstract. An image built from the three shapes no longer has to document a real installation, so it can be composed and iterated until it carries the message. It also gives the brand room to be more creative and to stand out in a category where everything looks the same.",
          "The people came back in through words: the roles the product serves, named on the page, and written quotes where a photo would have been impossible. The client loved it, and from that point the rest of the project moved quickly. The same shapes have since carried into their case studies and whitepapers.",
        ],
      },
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
