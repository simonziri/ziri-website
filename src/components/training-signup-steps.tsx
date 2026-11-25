"use client";

import { useMemo } from "react";
import { AuditOfferFlow } from "@/components/audit-offer-flow";
import { THANKS_CALENDAR_SLUG } from "@/data/client-videos";
import { calendarTracker } from "@/lib/watch-tracking";
import styles from "@/app/training/training.module.css";

/**
 * Thank-you-Seite für Trainings, die schon online sind (Simon 14.11., nach
 * Logan Lyles' "two-step sign-up flow"): Das Video kommt per Mail, hier folgen
 * ein paar Fragen und am Ende das Angebot eines Gratis-Audits.
 *
 *   Firmengröße -> Umsatz -> Warum / was nervt -> Audit ja/nein
 *   ja:   Nicht-Agentur ab $1M -> Cal.com-Kalender, sonst "wir melden uns"
 *   nein: Video-Breakdown-Formular, außer Agenturen unter $1M (Simon 23.11.)
 *
 * Ablauf und Regeln in AuditOfferFlow (gleicher Ablauf wie die Modals auf der
 * Watch-Seite). Privacy Policy Abschnitt 4 beschreibt diese Fragen.
 */
export function TrainingSignupSteps({
  slug,
  senderEmail,
}: {
  slug: string;
  senderEmail: string;
}) {
  // Kalender-Klicks messen (anonym, Simon 25.11.): Auswertung /watch-stats?v=thanks-calendar
  const track = useMemo(() => (typeof window === "undefined" ? () => {} : calendarTracker(THANKS_CALENDAR_SLUG)), []);
  return (
    <>
      <p className={styles.thanksNote}>
        The training is on its way to your inbox from <strong>{senderEmail}</strong>.
        Not there in a few minutes? Check your spam folder.
      </p>
      <AuditOfferFlow slug={slug} variant="thanks" onCalendarEvent={track} />
    </>
  );
}
