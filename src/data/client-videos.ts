import { getTrainingVideo } from "@/data/training-videos";

/*
 * Persönliche Videos für Kunden/Interessenten (Simon 25.11.): Simon nimmt in
 * Riverside auf, Claude schneidet, lädt das MP4 in den öffentlichen Blob-Store
 * (zufälliger Pfad) und trägt es hier ein. Seite: /v/<id>, noindex, nirgends
 * verlinkt, nicht in der Sitemap. Die ID ist zufällig, damit niemand Links
 * erraten kann.
 *
 * Zuschau-Messung wie beim Training (lib/watch-tracking.ts), Slug "v-<id>",
 * Auswertung unter /watch-stats?v=v-<id>.
 */

export type ClientVideo = {
  /** Firma, nur für uns (Dashboard-Liste) */
  client: string;
  /** Seitentitel und H1 */
  title: string;
  /** ein Satz unter der H1 */
  intro: string;
  /** "Recorded for …" */
  recordedFor: string;
  recordedOn: string;
  src: string;
  poster?: string;
  /** [Sekunde, Kapitelname], horizontal unter dem Video */
  chapters: readonly (readonly [number, string])[];
};

export const CLIENT_VIDEOS: Record<string, ClientVideo> = {
  // Beispiel (Simon 25.11.): Seiten-Review für Aiuta, aufgenommen 7.11. (Riverside "Edit - Simon")
  k7q2m9xa: {
    client: "Aiuta",
    title: "Website review: aiuta.com",
    intro:
      "What I'd look at first on your homepage: the hero, the page names, proof and the fit question.",
    recordedFor: "Alexis",
    recordedOn: "2026-11-07",
    src: "https://9xflaiothtexmvn1.public.blob.vercel-storage.com/client-videos/k7q2m9xa/aiuta-review-qxVZ3xB00HU7d8SuKSyY4BuSYsbofz.mp4",
    poster: "https://9xflaiothtexmvn1.public.blob.vercel-storage.com/client-videos/k7q2m9xa/poster-qcgGhtnwptz92yW2by8rkw4uYFvRkr.jpg",
    // Kapitel aus dem Transkript (assets/client-videos/aiuta/aiuta-review.txt im Lead-Magnet-Ordner)
    chapters: [
      [0, "Intro"],
      [45, "Hero video and cookie banner"],
      [164, "Headline and subline"],
      [297, "Page names"],
      [354, "News section and logos"],
      [476, "Proof with real numbers"],
      [561, "Product sections"],
      [679, "Integration logos"],
      [783, "The try-it funnel"],
      [892, "Calling out fit"],
      [1015, "Wrap-up"],
    ],
  },
};

export const getClientVideo = (id: string) => CLIENT_VIDEOS[id];

export const clientWatchSlug = (id: string) => `v-${id}`;

/** Alle Videos, die /api/watch annimmt und /watch-stats auswertet */
/** Thank-you-Seite: nur Kalender-Klicks, kein Video (Simon 25.11.) */
export const THANKS_CALENDAR_SLUG = "thanks-calendar";

export function getWatchVideo(slug: string):
  | {
      label: string;
      chapters: readonly (readonly [number, string])[];
      hasPitch: boolean;
      kind: "video" | "calendar";
    }
  | undefined {
  if (slug === THANKS_CALENDAR_SLUG)
    return { label: "Thank-you page calendar", chapters: [], hasPitch: false, kind: "calendar" };
  const training = getTrainingVideo(slug);
  if (training) return { label: "CRO training", chapters: training.chapters, hasPitch: true, kind: "video" };
  if (slug.startsWith("v-")) {
    const v = getClientVideo(slug.slice(2));
    if (v) return { label: `${v.client} video`, chapters: v.chapters, hasPitch: false, kind: "video" };
  }
  return undefined;
}

export const WATCH_SLUGS = [
  "cro-for-high-ticket-b2b",
  THANKS_CALENDAR_SLUG,
  ...Object.keys(CLIENT_VIDEOS).map(clientWatchSlug),
];
