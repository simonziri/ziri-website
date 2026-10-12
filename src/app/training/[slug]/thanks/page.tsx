import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { TrainingInterestForm } from "@/components/training-interest-form";
import { TrainingFooter, TrainingHeader } from "@/components/training-chrome";
import {
  TRAINING_SENDER_EMAIL,
  formatTrainingDate,
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
    title: `You're in | ${training.title}`,
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

  return (
    <div className={styles.page}>
      <TrainingHeader />
      <main className={styles.main}>
        <section className={styles.thanks} aria-labelledby="thanks-title">
          <h1 id="thanks-title">
            You&rsquo;re in. Your training arrives on {releaseDate}.
          </h1>
          <p>
            On {releaseDate}{" "}
            we&rsquo;ll email the recording of &ldquo;
            {training.title}&rdquo; to the address you signed up with. Nothing
            else to do until then.
          </p>
          <p>
            One small thing: add{" "}
            <strong>{TRAINING_SENDER_EMAIL}</strong>{" "}
            to your contacts, so the training doesn&rsquo;t land in spam.
          </p>
          <div
            className={styles.interestCard}
            role="region"
            aria-labelledby="interest-title"
            data-theme="light-primary"
          >
            <h2 id="interest-title">What topic is burning most right now?</h2>
            <p>
              We&rsquo;re still recording this training, so your answer goes
              straight into it.
            </p>
            <TrainingInterestForm
              slug={training.slug}
              labelledBy="interest-title"
            />
          </div>
          <div className={styles.thanksActions}>
            <PixelHatchButton
              href="https://www.linkedin.com/in/simonziri/"
              external
            >
              Connect on LinkedIn
            </PixelHatchButton>
            <PixelHatchButton href="/" variant="secondary">
              Go to homepage
            </PixelHatchButton>
          </div>
        </section>
      </main>
      <TrainingFooter />
    </div>
  );
}
