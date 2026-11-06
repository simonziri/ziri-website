import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { TrainingFooter, TrainingHeader } from "@/components/training-chrome";
import { TrainingInterestForm } from "@/components/training-interest-form";
import {
  TRAINING_SENDER_EMAIL,
  TRAINING_LIVE_PAGES,
  formatTrainingDate,
  getTraining,
} from "@/data/trainings";
import styles from "@/app/training/training.module.css";

/*
 * Platzhalter bis zum Release: hier läuft am 12.11. das Training, der Link
 * steht im Kalender-Eintrag. URL-Key → Training in TRAINING_LIVE_PAGES. Bis dahin: Datum, Hinweis auf die Erinnerungs-
 * Mail, Themen-Formular (gleiches wie früher auf der Thank-you-Seite) und
 * ein Weg zu uns, wenn es dringend ist.
 */

type Params = { key: string };

const trainingForKey = (key: string) => {
  const slug = TRAINING_LIVE_PAGES[key];
  return slug ? getTraining(slug) : undefined;
};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(TRAINING_LIVE_PAGES).map((key) => ({ key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { key } = await params;
  const training = trainingForKey(key);
  if (!training) return {};
  return {
    title: `Live on ${formatTrainingDate(training.releaseDate)} | ${training.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function TrainingLivePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { key } = await params;
  const training = trainingForKey(key);
  if (!training) notFound();

  const releaseDate = formatTrainingDate(training.releaseDate);

  return (
    <div className={styles.page}>
      <TrainingHeader />
      <main className={styles.main}>
        <section className={styles.thanks} aria-labelledby="watch-title">
          <p className={styles.stepTag}>Live training &middot; {releaseDate}</p>
          <h1 id="watch-title">
            This live training arrives here on {releaseDate}.
          </h1>
          <p>
            <strong>{training.title}</strong>{" "}
            We&rsquo;ll send you a reminder email from{" "}
            <strong>{TRAINING_SENDER_EMAIL}</strong>{" "}
            on the day, so
            there&rsquo;s nothing you need to do until then.
          </p>

          <div
            className={`${styles.loomCard} ${styles.watchCard}`}
            role="region"
            aria-labelledby="interest-title"
            data-theme="light-primary"
          >
            <h2 id="interest-title">What should the training cover for you?</h2>
            <p>
              Tell us which CRO question is on your mind right now. We read
              every answer and build the training around them.
            </p>
            <TrainingInterestForm slug={training.slug} labelledBy="interest-title" />
          </div>

          <div className={styles.thanksHurry}>
            <div>
              <h2>Something urgent?</h2>
              <p>
                If you need advice or hands-on help before {releaseDate}, reach
                out and we&rsquo;ll talk it through.
              </p>
            </div>
            <PixelHatchButton href="/#contact" variant="secondary">
              Get in touch
            </PixelHatchButton>
          </div>
        </section>
      </main>
      <TrainingFooter />
    </div>
  );
}
