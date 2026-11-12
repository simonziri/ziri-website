import { CRO_TRAINING_TRANSCRIPT } from "./training-video-cro-transcript";

/*
 * Videos der /watch-Seiten, je Training-Slug.
 *
 * Die Video-URL kommt aus einer Env-Variable. Ist sie nicht gesetzt, zeigt
 * /watch/<key> weiter die Platzhalter-Seite ("arrives here on ..."). So kann
 * der Player-Code live gehen, bevor das finale Video gehostet ist.
 * Lokal: .env.local -> TRAINING_VIDEO_CRO_SRC=/dev-media/cro-training.mp4
 * (public/dev-media/ ist nur lokal, nie committen).
 *
 * Hosting (Mux/Bunny o. Ä.) = neuer Auftragsverarbeiter: Privacy Policy im
 * selben Change anpassen. Ein MP4 von unserer eigenen Domain (Vercel) nicht.
 *
 * Endkarte (Simons Wahl 12.11., Variante E): blendet `endCardLeadSeconds` vor
 * Schluss ein, während das Video weiterläuft, und bleibt nach dem Ende.
 */

export type TrainingVideo = {
  src: string;
  poster?: string;
  /** [Sekunde, Kapitelname]; die letzte Zeile ist der Pitch */
  chapters: readonly (readonly [number, string])[];
  /** [Sekunde, Satz] – Untertitel + Transkript */
  transcript: readonly (readonly [number, string])[];
  endCardLeadSeconds: number;
};

const croVideoSrc = process.env.TRAINING_VIDEO_CRO_SRC;

const videos: Record<string, TrainingVideo | undefined> = {
  "cro-for-high-ticket-b2b": croVideoSrc
    ? {
        src: croVideoSrc,
        poster: process.env.TRAINING_VIDEO_CRO_POSTER || undefined,
        // Kapitel des finalen Schnitts (edit/final/charlie-one-final-v3.mp4); Titel = Entwurf, Simon bestätigt
        chapters: [
          [0, "Where we got stuck"],
          [437.75, "Big swings, not small tests"],
          [1180.29, "Conversions aren't sales"],
          [1320.29, "Where good ideas come from"],
          [1852.09, "The whole buying group"],
          [2377.04, "How we can help"],
        ],
        transcript: CRO_TRAINING_TRANSCRIPT,
        endCardLeadSeconds: 10,
      }
    : undefined,
};

export const getTrainingVideo = (slug: string) => videos[slug];
