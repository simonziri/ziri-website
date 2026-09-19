import type { MetadataRoute } from "next";

/* Preview-/Staging-Deployments (Vercel-Branches, PRs) dürfen nicht indexiert
   werden. VERCEL_ENV setzt Vercel selbst: "production" | "preview" | "development". */
const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://simonziri.com/sitemap.xml",
  };
}
