import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTrainingVideo } from "@/data/training-videos";
import { TrainingSignupSteps } from "@/components/training-signup-steps";
import { TrainingThanksFlow } from "@/components/training-thanks-flow";
import { TrainingFooter, TrainingHeader } from "@/components/training-chrome";
import {
  TRAINING_SENDER_EMAIL,
  formatTrainingDate,
  getCalendarLinks,
  getTraining,
  trainings,
} from "@/data/trainings";
import styles from "../../training.module.css";

type Params = { slug: string };

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
    title: getTrainingVideo(training.slug)
      ? `One last step | ${training.title}`
      : `Almost done | ${training.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function TrainingThanksPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const training = getTraining(slug);
  if (!training) notFound();

  // Training schon online: Video kommt per Mail, hier statt Kalender die
  // Fragen + Audit-Angebot (Simon 14.11.)
  const isLive = Boolean(getTrainingVideo(training.slug));

  const releaseDate = formatTrainingDate(training.releaseDate);
  const calendar = getCalendarLinks(training);

  return (
    <div className={styles.page}>
      <TrainingHeader />
      <main className={styles.main}>
        <section className={styles.thanks} aria-labelledby="thanks-title">
          {isLive ? (
            <TrainingSignupSteps slug={training.slug} senderEmail={TRAINING_SENDER_EMAIL} />
          ) : (
            <TrainingThanksFlow
              slug={training.slug}
              releaseDate={releaseDate}
              senderEmail={TRAINING_SENDER_EMAIL}
              calendar={calendar}
            />
          )}
        </section>
      </main>
      <TrainingFooter />
    </div>
  );
}
