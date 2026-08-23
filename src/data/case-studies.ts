/*
 * Case study content model.
 *
 * Structured to map 1:1 onto a CMS collection later (Sanity):
 * every field below becomes a document field, `gallery` becomes an
 * array of typed blocks. Keep components dumb — they only read this shape.
 */

export type CaseStudyKpi = {
  value: string;
  label: string;
};

export type CaseStudyImage = {
  src: string;
  alt: string;
  /** "cover" (default) fills the tile; "contain" letterboxes with
   *  padding and a subtle drop shadow. */
  fit?: "cover" | "contain";
};

/** One row in the project gallery. `full` = single wide image;
 *  `largeLeft`/`largeRight` = bento pair, the large image carries the row. */
export type GalleryRow =
  | { layout: "full"; image: CaseStudyImage }
  | { layout: "largeLeft" | "largeRight"; large: CaseStudyImage; small: CaseStudyImage };

export type CaseStudyTestimonial = {
  quote: string[];
  name: string;
  role: string;
  avatar?: string;
};

export type CaseStudyVideo = {
  /** Embed URL (YouTube/Vimeo/mp4). Empty while we only reserve the slot. */
  url?: string;
  poster?: string;
};

export type CaseStudy = {
  slug: string;
  client: string;
  logo: string;
  /** Card/preview image used by listings (Featured Work, etc.). */
  thumbnail: CaseStudyImage;
  title: string;
  /** Optional 1:1 video embed next to the headline. */
  video?: CaseStudyVideo;
  /** 0–4 entries; the band is hidden when empty. */
  kpis: CaseStudyKpi[];
  heroImage: CaseStudyImage;
  gallery: GalleryRow[];
  testimonial?: CaseStudyTestimonial;
  industry: string;
  year: string;
  services: string[];
  /** Used for <meta name="description">. */
  summary: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "circula",
    client: "Circula",
    logo: "/assets/tab-logos/Circula.svg",
    thumbnail: {
      src: "/assets/featured/project-image-1.avif",
      alt: "Circula website before and after the ZIRI redesign",
    },
    title:
      "Research, message & conversion: How ZIRI rebuilt Circula's website around what buyers actually need.",
    video: {
      // Beispiel-Embed als Platzhalter, bis echte Testimonial-Videos da sind.
      url: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ",
    },
    kpis: [
      { value: "+38%", label: "Demo requests" },
      { value: "2.1×", label: "Landing page conversion" },
      { value: "8", label: "Buyer interviews" },
    ],
    heroImage: {
      src: "/assets/featured/project-image-1.avif",
      alt: "The relaunched Circula website",
    },
    gallery: [
      {
        layout: "largeLeft",
        large: {
          src: "/assets/featured/circula-after.png",
          alt: "Circula homepage after the redesign",
        },
        small: {
          src: "/assets/featured/circula-before.png",
          alt: "Circula homepage before the redesign",
          fit: "contain",
        },
      },
    ],
    testimonial: {
      quote: [
        "“We partnered with ZIRI for the relaunch of our website, and the experience was flawless from start to finish. The team demonstrated outstanding responsiveness and undeniable expertise.”",
        "“Beyond the launch, they continue to support us on a daily basis. They're a trusted partner we can truly rely on.”",
      ],
      name: "Jane Doe",
      role: "Head of Marketing @Circula",
    },
    industry: "Expense Management",
    year: "2026",
    services: ["Research", "Messaging", "Web Design", "Development"],
    summary:
      "How ZIRI rebuilt Circula's website around buyer research and message testing — placeholder case study.",
  },
  {
    slug: "simplesense",
    client: "Simplesense",
    logo: "/assets/tab-logos/Simplesense.svg",
    thumbnail: {
      src: "/assets/featured/project-image-2.avif",
      alt: "Simplesense website before and after the ZIRI redesign",
    },
    title:
      "From feature list to sales tool: the Simplesense website relaunch.",
    kpis: [
      { value: "−31%", label: "Bounce rate" },
      { value: "6 weeks", label: "To launch" },
    ],
    heroImage: {
      src: "/assets/featured/project-image-2.avif",
      alt: "The relaunched Simplesense website",
    },
    gallery: [
      {
        layout: "full",
        image: {
          src: "/assets/featured/project-image-2.avif",
          alt: "Simplesense website overview",
        },
      },
    ],
    testimonial: {
      quote: [
        "“ZIRI understood our buyers better than we did. The new site finally sells the product the way our best rep would.”",
      ],
      name: "John Doe",
      role: "CEO @Simplesense",
    },
    industry: "Emergency Response Technology",
    year: "2026",
    services: ["Research", "Web Design"],
    summary:
      "The Simplesense website relaunch by ZIRI — placeholder case study.",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((entry) => entry.slug === slug);
}

export function getNextCaseStudy(slug: string): CaseStudy | undefined {
  const index = caseStudies.findIndex((entry) => entry.slug === slug);
  if (index === -1) return undefined;
  return caseStudies[(index + 1) % caseStudies.length];
}
