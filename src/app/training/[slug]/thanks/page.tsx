import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    title: `Almost done | ${training.title}`,
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

  const releaseDate = formatTrainingDate(training.releaseDate);
  const calendar = getCalendarLinks(training);

  return (
    <div className={styles.page}>
      <TrainingHeader />
      <main className={styles.main}>
        <section className={styles.thanks} aria-labelledby="thanks-title">
          <TrainingThanksFlow
            slug={training.slug}
            releaseDate={releaseDate}
            senderEmail={TRAINING_SENDER_EMAIL}
            calendar={calendar}
          />
        </section>
      </main>
      <TrainingFooter />
    </div>
  );
}
