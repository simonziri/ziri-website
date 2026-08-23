import { notFound } from "next/navigation";
import { CaseStudyArticle } from "@/components/case-study/case-study-article";
import { CaseStudyPanel } from "@/components/case-study/case-study-panel";
import { getCaseStudy } from "@/data/case-studies";

export default async function CaseStudyModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <CaseStudyPanel>
      <CaseStudyArticle caseStudy={caseStudy} inPanel />
    </CaseStudyPanel>
  );
}
