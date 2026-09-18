import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CaseStudy, CaseStudySection, GalleryRow } from "@/data/case-studies";
import { getNextCaseStudy } from "@/data/case-studies";
import { BackLink } from "./back-link";
import styles from "./case-study-article.module.css";

function GalleryRowView({ row }: { row: GalleryRow }) {
  if (row.layout === "full") {
    return (
      <div className={styles.galleryRow}>
        <Image
          className={styles.galleryImage}
          src={row.image.src}
          alt={row.image.alt}
          width={row.image.width}
          height={row.image.height}
          sizes="(max-width: 991px) 100vw, 1322px"
        />
      </div>
    );
  }

  // Bento: Spaltenbreiten folgen den Seitenverhältnissen, damit alle
  // Bilder der Reihe dieselbe gerenderte Höhe haben.
  const columns = row.images
    .map((image) => `${(image.width / image.height).toFixed(4)}fr`)
    .join(" ");

  return (
    <div
      className={styles.galleryRow}
      data-bento=""
      style={{ gridTemplateColumns: columns }}
    >
      {row.images.map((image) => (
        <Image
          className={styles.galleryImage}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 991px) 100vw, 660px"
          key={image.src}
        />
      ))}
    </div>
  );
}

// Minimal inline markup for body copy: `[text](url)` becomes a link.
// External links open in a new tab; everything else stays plain text.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(
      <a href={match[2]} target="_blank" rel="noreferrer" key={start}>
        {match[1]}
      </a>,
    );
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function SectionView({ section }: { section: CaseStudySection }) {
  return (
    <section className={styles.section}>
      {section.label ? (
        <p className={styles.sectionLabel}>{section.label}</p>
      ) : null}
      <h2 className={styles.sectionHeading}>{section.heading}</h2>
      {section.paragraphs.map((paragraph) => (
        <p className={styles.sectionBody} key={paragraph.slice(0, 32)}>
          {renderInline(paragraph)}
        </p>
      ))}
    </section>
  );
}

export function CaseStudyArticle({
  caseStudy,
  inPanel = false,
}: {
  caseStudy: CaseStudy;
  /** Rendered inside the slide-over: links must not scroll the page below. */
  inPanel?: boolean;
}) {
  const next = getNextCaseStudy(caseStudy.slug);
  const linkScroll = inPanel ? false : undefined;
  const hasKpis = Boolean(caseStudy.kpis && caseStudy.kpis.length > 0);
  // Testimonial steht immer direkt unter dem ersten Bild
  const [firstGalleryRow, ...moreGalleryRows] = caseStudy.gallery;

  return (
    <article className={styles.article}>
      <div className={styles.inset}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <BackLink className={styles.crumbBack} inPanel={inPanel}>
            ← Back to Homepage
          </BackLink>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            {caseStudy.logo ? (
              <Image
                className={styles.heroLogo}
                src={caseStudy.logo}
                alt={caseStudy.client}
                width={160}
                height={32}
              />
            ) : null}
            <div>
              <h1 className={styles.title} data-reveal="sweep">
                {caseStudy.title}
              </h1>
              <p className={styles.sub}>{caseStudy.sub}</p>
            </div>
          </div>
          {caseStudy.video ? (
            <div className={styles.video}>
              {caseStudy.video.url ? (
                <iframe
                  className={styles.videoEmbed}
                  src={caseStudy.video.url}
                  title={`${caseStudy.client} video`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <span className={styles.videoPlay} aria-hidden="true" />
              )}
            </div>
          ) : null}
        </header>

        {caseStudy.kpis && caseStudy.kpis.length > 0 ? (
          <ul className={styles.kpis}>
            {caseStudy.kpis.map((kpi) => (
              <li key={kpi.label}>
                <span className={styles.kpiValue}>{kpi.value}</span>
                <span className={styles.kpiLabel}>{kpi.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className={
            hasKpis ? styles.summary : `${styles.summary} ${styles.summaryNoKpis}`
          }
        >
          <p>{caseStudy.summary}</p>
          {caseStudy.note ? (
            <p className={styles.note}>{caseStudy.note}</p>
          ) : null}
        </div>

        {firstGalleryRow ? (
          <div className={styles.gallery}>
            <GalleryRowView row={firstGalleryRow} />
          </div>
        ) : null}
      </div>

      {caseStudy.testimonial ? (
        <div className={styles.narrow}>
          <section className={styles.testimonial} aria-label="Testimonial">
            <blockquote className={styles.quote}>
              {caseStudy.testimonial.quote.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </blockquote>
            <div className={styles.author}>
              <span className={styles.avatar}>
                {caseStudy.testimonial.avatar ? (
                  <Image
                    src={caseStudy.testimonial.avatar}
                    alt={caseStudy.testimonial.name}
                    fill
                    sizes="42px"
                  />
                ) : null}
              </span>
              <span>
                <span className={styles.authorName}>
                  {caseStudy.testimonial.name}
                </span>
                <span className={styles.authorRole}>
                  {caseStudy.testimonial.role}
                </span>
              </span>
            </div>
          </section>
        </div>
      ) : null}

      {caseStudy.sections && caseStudy.sections.length > 0 ? (
        <div className={`${styles.narrow} ${styles.sections}`}>
          {caseStudy.sections.map((section) => (
            <SectionView key={section.heading} section={section} />
          ))}
        </div>
      ) : null}

      {moreGalleryRows.length > 0 ? (
        <div className={styles.inset}>
          <div className={styles.gallery}>
            {moreGalleryRows.map((row, index) => (
              <GalleryRowView key={index} row={row} />
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.narrow}>
        {next && next.slug !== caseStudy.slug ? (
          <Link
            className={styles.next}
            href={`/work/${next.slug}`}
            replace={inPanel}
            scroll={linkScroll}
          >
            <span>
              <span className={styles.nextLabel}>Next Case</span>
              <span className={styles.nextClient}>{next.client}</span>
            </span>
            <span className={styles.nextArrow} aria-hidden="true">
              →
            </span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
