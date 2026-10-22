import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { SectionTag } from "@/components/section-tag";
import { TrainingFooter, TrainingHeader } from "@/components/training-chrome";
import { TrainingSignupForm } from "@/components/training-signup-form";
import { formatTrainingDate, getTraining, trainings } from "@/data/trainings";
import styles from "../training.module.css";

type Params = { slug: string };

/* Nur die Trainings aus src/data/trainings.ts existieren. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return trainings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const training = getTraining(slug);
  if (!training) return {};
  return {
    title: `${training.title} | Free training by ZIRI`,
    description: training.outcome ?? training.title,
    // Lead-Magnet-Seiten nie indexieren, unabhängig von der Umgebung
    robots: { index: false, follow: false },
    openGraph: {
      title: training.title,
      description: training.outcome ?? training.title,
      ...(training.image ? { images: [training.image.src] } : {}),
    },
  };
}

/* Bestehende Kunden-Logos (Live-Cases) als kleiner Vertrauensstreifen */
const clientLogos = [
  { src: "/assets/tab-logos/HockeyStack.svg", alt: "HockeyStack" },
  { src: "/assets/tab-logos/Leapsome.svg", alt: "Leapsome" },
  { src: "/assets/tab-logos/Circula.svg", alt: "Circula" },
  { src: "/assets/tab-logos/Simplesense.svg", alt: "Simplesense" },
  { src: "/assets/tab-logos/Instaffo.svg", alt: "Instaffo" },
] as const;

export default async function TrainingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const training = getTraining(slug);
  if (!training) notFound();

  const releaseDate = formatTrainingDate(training.releaseDate);

  return (
    <div className={styles.page}>
      <TrainingHeader />
      <main className={styles.main}>
        <div className={styles.layout}>
          <section className={styles.hero} aria-labelledby="training-title">
            <SectionTag>Free training</SectionTag>
            <h1 id="training-title">
              {training.titleSecondary &&
              training.title.endsWith(training.titleSecondary) ? (
                <>
                  {training.title.slice(0, -training.titleSecondary.length)}
                  <span className={styles.titleSecondary}>
                    {training.titleSecondary}
                  </span>
                </>
              ) : (
                training.title
              )}
            </h1>
            {training.outcome ? (
              <p className={styles.outcome}>{training.outcome}</p>
            ) : null}
            {/* Nur mobil/Tablet sichtbar: dort liegt das Formular weit unten */}
            <div className={styles.jumpToForm}>
              <PixelHatchButton href="#signup">Get the free training</PixelHatchButton>
              <a className={styles.byline} href="#teacher">
                <Image
                  src="/assets/simon-ziri.jpg"
                  alt=""
                  width={28}
                  height={28}
                  sizes="28px"
                />
                by Simon Ziri
              </a>
            </div>
            {training.image ? (
              <Image
                src={training.image.src}
                alt={training.image.alt}
                width={training.image.width}
                height={training.image.height}
                sizes="(max-width: 991px) 100vw, 50vw"
              />
            ) : null}
            <div className={styles.learn}>
              <p className={styles.monoLabel} id="learn-title">
                After this you&rsquo;ll know
              </p>
              <ul className={styles.bullets} aria-labelledby="learn-title">
                {training.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <p className={styles.release}>
              Free recorded training. Sent to your inbox on{" "}
              <strong>{releaseDate}</strong>.
            </p>
          </section>

          <div
            className={styles.formCard}
            id="signup"
            role="region"
            aria-labelledby="training-form-title"
            data-theme="light-primary"
          >
            <h2 id="training-form-title">Get the free training</h2>
            <p>We&rsquo;ll email you the recording on {releaseDate}.</p>
            <TrainingSignupForm slug={training.slug} />
          </div>

          <section
            className={styles.teacher}
            id="teacher"
            aria-labelledby="teacher-title"
          >
            <p className={styles.monoLabel}>Who&rsquo;s teaching</p>
            <div className={styles.teacherBody}>
              <Image
                className={styles.avatar}
                src="/assets/simon-ziri.jpg"
                alt="Simon Ziri"
                width={112}
                height={112}
                sizes="112px"
              />
              <h2 id="teacher-title">Simon Ziri, founder of ZIRI</h2>
              <p>
                ZIRI builds websites for B2B companies where each customer is
                worth 5 to 7 figures. Recent work includes a 1,000+ page
                relaunch for Leapsome, done in just 5 weeks, and a 200+ page
                relaunch for Circula, which just got acquired by Personio.
              </p>
            </div>
            <p className={styles.logosLabel}>Companies ZIRI has worked with</p>
            <div className={styles.logos} aria-label="Selected ZIRI clients">
              {clientLogos.map((logo) => (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={262}
                  height={58}
                  key={logo.src}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      <TrainingFooter />
    </div>
  );
}
