import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientPlayer } from "@/components/client-player";
import { TrainingFooter, TrainingHeader } from "@/components/training-chrome";
import { CLIENT_VIDEOS, clientWatchSlug, getClientVideo } from "@/data/client-videos";
import styles from "@/app/training/training.module.css";

/*
 * Persönliches Video für einen Kunden/Interessenten (Simon 25.11.).
 * Daten: data/client-videos.ts. noindex, nicht verlinkt, nicht in der Sitemap.
 */

type Params = { id: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(CLIENT_VIDEOS).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const v = getClientVideo(id);
  return {
    title: v ? v.title : "Video",
    robots: { index: false, follow: false, nocache: true },
  };
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function ClientVideoPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const v = getClientVideo(id);
  if (!v) notFound();

  return (
    <div className={styles.page}>
      <TrainingHeader />
      <main className={styles.main}>
        <div className={styles.watch}>
          <section className={styles.watchIntro} aria-labelledby="video-title">
            <p className={styles.stepTag}>Recorded for {v.recordedFor}</p>
            <h1 id="video-title">{v.title}</h1>
            <p>{v.intro}</p>
            <p className={styles.watchMeta}>
              Simon Ziri, founder of ZIRI &middot; {fmtDate(v.recordedOn)}
            </p>
          </section>
          <ClientPlayer
            slug={clientWatchSlug(id)}
            src={v.src}
            poster={v.poster}
            title={v.title}
            chapters={v.chapters}
          />
        </div>
      </main>
      <TrainingFooter />
    </div>
  );
}
