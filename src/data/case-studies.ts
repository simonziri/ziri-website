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
 *  Paragraphs may contain markdown-style links `[text](url)`.
 *  `image` renders a gallery row right after the section to break up
 *  the text; never set it on two sections in a row or on the last one. */
export type CaseStudySection = {
  label?: string;
  heading: string;
  paragraphs: string[];
  image?: GalleryRow;
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
    sub: "Over 1.5 years as Leapsome's web agency: strategy and messaging, web design, development, conversion optimization and team enablement. A recent highlight: the relaunch, five weeks from first asset to live, with 166 static pages, 45 CMS templates and roughly 5,500 indexed URLs, in English and German.",
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
      "Leapsome sells HR software to companies where a buying decision runs through HR, finance, IT and the exec team. Deals take months. We have been their website partner for over 1.5 years, across strategy and messaging, design, development, conversion optimization and team enablement. What follows is a collection of highlights from that time, from the ongoing retainer work to the full relaunch.",
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
        heading: "The Leapsome website relaunch, in five weeks",
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
        heading: "Making the site easy to change",
        paragraphs: [
          "Early in the partnership, we set the site up so marketing could move without waiting on a developer. Page templates got a shared structure, and the pieces marketing touches most became reusable blocks. The measure we cared about was how long it takes a marketer to get a new page live without asking anyone. That time dropped by around 90%.",
          "This groundwork made everything above possible: the conversion program, the team shipping pages on their own, and a relaunch in five weeks.",
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
    title: "Rebrand & Relaunch for Simplesense",
    sub: "A full rebrand and relaunch that make critical infrastructure instantly understandable to the people responsible for it.",
    summary:
      "Simplesense gives the people responsible for critical infrastructure one view of the systems underneath their operations: power, water, security and communications, on equipment that was never built to talk to each other. The platform is built for power, utilities, facilities and defense, with its deepest track record on military installations. The product is complex, the buyers are senior and careful, and the category has a look everyone recognizes. We refreshed the brand around the green dot from their logo, built a visual language, set the visual direction for the product's dashboards so it reads at a glance, and relaunched the website.",
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
          "The people Simplesense sells to keep critical infrastructure running: installation leaders, facility and energy managers, security and incident response teams. They have sat through a lot of vendor pitches, and with defense as the strongest reference, the obvious move would have been to look like defense tech. Those sites tend to look alike. Dark mode, full-screen video, threat language, technology first. Simplesense wanted a white, quiet site that makes a complex product simple to grasp, and a company that is visibly about people. Their own line for it is Mission First, People Always.",
          "Simplesense came to us through TRU VM, a marketing agency we have worked with since our early days. The old site had a clear weak spot: it explained how the technology works long before it said what the person in charge gets out of it.",
        ],
      },
      {
        label: "The audience",
        heading: "Buyers who notice every wrong detail",
        paragraphs: [
          "Selling into critical infrastructure changes what a website has to do. The person reading is accountable for an entire site, and a decision like this passes through several layers before anyone signs. A site that feels clever and leaves them unsure what the product does gets closed within seconds. It has to show early that the product is deployed, running and ready to scale, and that Simplesense is a software company, because a lot of technology in this space never makes it past the prototype and these buyers know it.",
          "The usual ways to build trust are mostly off the table. Customers in this world rarely appear in video testimonials, photos of real users are out, and anything that comes from an operational environment needs care. At this level a screenshot, an image or a number on a public page can reveal more than intended, so every visual gets checked for what it might give away before it goes live. The audience also knows every detail of these systems, so anything inaccurate gets spotted immediately. Accuracy and caution belong in the design brief from day one.",
        ],
      },
      {
        label: "The dashboards",
        heading: "The product at a glance",
        paragraphs: [
          "The dashboard is the clearest answer to what Simplesense does, so it had to look like the brand. We set its visual direction: an operator view and a command view, on the same white ground and with the same restraint as the site. Color does the work. Green means mission ready, terracotta means degraded and action required, and every element on the screen reads that state at a glance.",
          "At the top of the platform page, the command view carries the story on its own. It shows the status of an entire installation, electricity, water, security and comms in one combined view, and as you scroll it moves from Degraded back to Online. That transition is what Simplesense delivers, through clarity, awareness and systems that finally talk to each other.",
          "Clean visuals are a core part of how we work. Going deep once, into a proper source of truth for the product, makes every visual that follows better and faster, on the website and in everything that comes after it.",
        ],
        image: { layout: "full", image: img("simplesensedashboards.avif", "Simplesense dashboards: operator view in mission-ready and degraded state, and the command view", 3588, 1222) },
      },
      {
        label: "The visual language",
        heading: "Four shapes that cannot talk to each other",
        paragraphs: [
          "Simplesense connects systems in infrastructure that were never built to communicate. That became the whole language. Every visual starts from four forms, a circle, a square, a triangle and a diamond, standing in for the infrastructure domains and the people who have to work together on an installation. The circle is the green dot from the Simplesense logo, the one element of the old brand everyone wanted to keep. At the start of each visual the shapes sit apart. Then they connect, and the picture comes together. That movement, from scattered forms to one clear image, is the Simplesense effect, and it is the sentence the brand runs on: turn complexity into clarity.",
          "Operators read flowchart symbols every day, so the shapes were checked against what those symbols already mean, to keep a visual from accidentally saying the wrong thing. Beyond that the rules are deliberately loose, and a small generator turns the shapes into patterns, so the system grows past what anyone draws by hand. What we cared about is that every visual, on every page, tells the same story.",
        ],
        image: { layout: "full", image: img("simplesensebottom.avif", "Simplesense visual language", 2517, 963) },
      },
      {
        label: "The imagery",
        heading: "Accurate, good-looking, or abstract",
        paragraphs: [
          "Imagery is a familiar problem in critical infrastructure and defense. Pictures have to be accurate, because the audience knows every detail and spots anything wrong immediately. They also have to look good, and real infrastructure is cables, racks and clutter. Photos of actual users are off limits in this world, and stock photography was ruled out early. Sites in the category tend to settle for accurate and pay for it with pages that look like a server room. We went abstract. An image built from the shapes no longer has to document a real installation, so it can be composed and iterated until it carries the message. It also gives the brand room to be more creative and to stand out in a category where everything looks the same.",
          "Where a real subject has to appear, an aircraft, a ship, a base, the photo dissolves into data points in the same dot language, made with a tool we built for exactly that. The people came back in through words: the roles the product serves, named on the page, and written quotes where a photo would have been impossible. The same system has since carried into their case studies and whitepapers, and into a brand guide and design system their team uses to carry the new look into all of its own materials.",
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
      "We revamped HockeyStack's colors, typography, and visual language, then redesigned and redeveloped the homepage to match where the product had grown.",
    note: "Commissioned by Quarter Digital.",
    logo: "/assets/tab-logos/HockeyStack.svg",
    thumbnail: {
      src: "/assets/featured/hockeystack-thumb.avif",
      alt: "HockeyStack homepage redesign",
      width: 1544,
      height: 1544,
    },
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
