import type { MetadataRoute } from "next";
import { listedCaseStudies } from "@/data/case-studies";

const SITE_URL = "https://simonziri.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    // Drafts bleiben bewusst draußen (listedCaseStudies filtert sie)
    ...listedCaseStudies.map((entry) => ({
      url: `${SITE_URL}/work/${entry.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/imprint`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
