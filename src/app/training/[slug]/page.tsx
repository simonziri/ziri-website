import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
    description: training.outcome,
    // Lead-Magnet-Seiten nie indexieren, unabhängig von der Umgebung
    robots: { index: false, follow: false },
    openGraph: {
      title: training.title,
      description: training.outcome,
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
            <h1 id="training-title">{training.title}</h1>
            <p className={styles.outcome}>{training.outcome}</p>
            {training.image ? (
              <Image
                src={training.image.src}
                alt={training.image.alt}
                width={training.image.width}
                height={training.image.height}
                sizes="(max-width: 991px) 100vw, 50vw"
              />
            ) : null}
            <ul className={styles.bullets}>
              {training.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className={styles.release}>
              Free recorded training. Sent to your inbox on{" "}
              <strong>{releaseDate}</strong>.
            </p>
          </section>

          <div
            className={styles.formCard}
            role="region"
            aria-labelledby="training-form-title"
            data-theme="light-primary"
          >
            <h2 id="training-form-title">Get the free training</h2>
            <p>We&rsquo;ll email you the recording on {releaseDate}.</p>
            <TrainingSignupForm slug={training.slug} />
          </div>

          <section className={styles.teacher} aria-labelledby="teacher-title">
            <p className={styles.monoLabel}>Who&rsquo;s teaching</p>
            <div className={styles.teacherRow}>
              <Image
                className={styles.avatar}
                src="/assets/simon-ziri.jpg"
                alt="Simon Merkt"
                width={64}
                height={64}
                sizes="64px"
              />
              <div>
                <h2 id="teacher-title">Simon Merkt, founder of ZIRI</h2>
                <p>
                  ZIRI builds websites for B2B companies where one deal is
                  worth €10k+. Recent work includes 1,000+ pages relaunched in
                  5 weeks and +20% on a €10k+ ACV demo page.
                </p>
              </div>
            </div>
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
