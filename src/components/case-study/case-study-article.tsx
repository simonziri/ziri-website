import Image from "next/image";
import Link from "next/link";
import type { CaseStudy, GalleryRow } from "@/data/case-studies";
import { getNextCaseStudy } from "@/data/case-studies";
import { BackLink } from "./back-link";
import styles from "./case-study-article.module.css";

function GalleryRowView({ row }: { row: GalleryRow }) {
  if (row.layout === "full") {
    return (
      <div className={styles.galleryRow} data-layout="full">
        <figure
          className={styles.galleryImage}
          data-role="large"
          data-fit={row.image.fit ?? "cover"}
        >
          <Image
            src={row.image.src}
            alt={row.image.alt}
            fill
            sizes="(max-width: 991px) 100vw, 1322px"
          />
        </figure>
      </div>
    );
  }

  const large = (
    <figure
      className={styles.galleryImage}
      data-role="large"
      data-fit={row.large.fit ?? "cover"}
      key="large"
    >
      <Image
        src={row.large.src}
        alt={row.large.alt}
        fill
        sizes="(max-width: 640px) 100vw, 66vw"
      />
    </figure>
  );
  const small = (
    <figure
      className={styles.galleryImage}
      data-role="small"
      data-fit={row.small.fit ?? "cover"}
      key="small"
    >
      <Image
        src={row.small.src}
        alt={row.small.alt}
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
      />
    </figure>
  );

  return (
    <div className={styles.galleryRow} data-layout={row.layout}>
      {row.layout === "largeLeft" ? [large, small] : [small, large]}
    </div>
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
            <Image
              className={styles.heroLogo}
              src={caseStudy.logo}
              alt={caseStudy.client}
              width={160}
              height={32}
            />
            <h1 className={styles.title}>{caseStudy.title}</h1>
          </div>
          {caseStudy.video ? (
            <div className={styles.video}>
              {caseStudy.video.url ? (
                <iframe
                  className={styles.videoEmbed}
                  src={caseStudy.video.url}
                  title={`${caseStudy.client} testimonial video`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <span className={styles.videoPlay} aria-hidden="true" />
              )}
            </div>
          ) : null}
        </header>

        {caseStudy.kpis.length > 0 ? (
          <ul className={styles.kpis}>
            {caseStudy.kpis.map((kpi) => (
              <li key={kpi.label}>
                <span className={styles.kpiValue}>{kpi.value}</span>
                <span className={styles.kpiLabel}>{kpi.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={styles.gallery}>
          <div className={styles.galleryRow} data-layout="full">
            <figure className={styles.galleryImage} data-role="hero">
              <Image
                src={caseStudy.heroImage.src}
                alt={caseStudy.heroImage.alt}
                fill
                priority
                sizes="(max-width: 991px) 100vw, 1322px"
              />
            </figure>
          </div>
          {caseStudy.gallery.map((row, index) => (
            <GalleryRowView key={index} row={row} />
          ))}
        </div>
      </div>

      <div className={styles.narrow}>
        {caseStudy.testimonial ? (
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
        ) : null}

        <dl className={styles.meta}>
          <div>
            <dt className={styles.metaKey}>Industry</dt>
            <dd className={styles.metaValue}>{caseStudy.industry}</dd>
          </div>
          <div>
            <dt className={styles.metaKey}>Year</dt>
            <dd className={styles.metaValue}>{caseStudy.year}</dd>
          </div>
          <div>
            <dt className={styles.metaKey}>Services</dt>
            <dd className={styles.metaValue}>
              {caseStudy.services.map((service) => (
                <span key={service} style={{ display: "block" }}>
                  {service}
                </span>
              ))}
            </dd>
          </div>
        </dl>

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
