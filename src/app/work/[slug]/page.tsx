import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyArticle } from "@/components/case-study/case-study-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCaseStudy, listedCaseStudies } from "@/data/case-studies";
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
  return {
    title: `${caseStudy.client} Case Study | ZIRI`,
    description: caseStudy.summary,
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
        <SiteHeader />
        <CaseStudyArticle caseStudy={caseStudy} />
        <SiteFooter />
      </div>
    </main>
  );
}
