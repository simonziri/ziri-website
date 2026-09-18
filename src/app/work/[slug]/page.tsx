import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyArticle } from "@/components/case-study/case-study-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getCaseStudy,
  listedCaseStudies,
  type CaseStudy,
} from "@/data/case-studies";
import styles from "../../page.module.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  // Drafts bleiben erreichbar, werden aber nicht vorgerendert/verlinkt.
  return listedCaseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) return {};
  const title = caseStudy.seo?.title ?? `${caseStudy.client} Case Study | ZIRI`;
  const description = caseStudy.seo?.description ?? caseStudy.summary;
  return {
    title,
    description,
    ...(caseStudy.seo?.keywords ? { keywords: caseStudy.seo.keywords } : {}),
    alternates: { canonical: `/work/${caseStudy.slug}` },
    openGraph: {
      type: "article",
      title,
      description: caseStudy.seo?.description ?? caseStudy.sub,
      ...(caseStudy.thumbnail ? { images: [caseStudy.thumbnail.src] } : {}),
    },
    // Drafts sind erreichbar, sollen aber nicht in den Index
    ...(caseStudy.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

const SITE_URL = "https://simonziri.com";

/* Strukturierte Daten pro Case: Article über den Kunden, verfasst von
   ZIRI (verweist auf die Organisation aus layout.tsx). */
function caseJsonLd(caseStudy: CaseStudy) {
  const url = `${SITE_URL}/work/${caseStudy.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: caseStudy.seo?.title ?? caseStudy.title,
    alternativeHeadline: caseStudy.title,
    description: caseStudy.seo?.description ?? caseStudy.summary,
    url,
    mainEntityOfPage: url,
    inLanguage: "en",
    ...(caseStudy.thumbnail
      ? { image: `${SITE_URL}${caseStudy.thumbnail.src}` }
      : {}),
    ...(caseStudy.seo?.keywords
      ? { keywords: caseStudy.seo.keywords.join(", ") }
      : {}),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: {
      "@type": "Organization",
      name: caseStudy.client,
      ...(caseStudy.clientUrl ? { url: caseStudy.clientUrl } : {}),
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        {caseStudy.draft ? null : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(caseJsonLd(caseStudy)),
            }}
          />
        )}
        <SiteHeader />
        <CaseStudyArticle caseStudy={caseStudy} />
        <SiteFooter />
      </div>
    </main>
  );
}
