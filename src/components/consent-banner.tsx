"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  allChoices,
  CONSENT_CATEGORIES,
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  type ConsentChoices,
  readConsent,
  writeConsent,
} from "@/lib/consent";
import { applyTrackingConsent, trackEvent } from "@/lib/analytics";
import styles from "./consent-banner.module.css";
import { TRAINING_QUALIFIED_ROLES } from "@/data/trainings";

/*
 * Consent-Banner + zentrale Analytics-Steuerung (in layout.tsx eingehängt,
 * gilt damit für alle Seiten).
 *
 * - Erstbesuch (keine gültige Wahl in localStorage): Banner erscheint.
 *   "Accept all" und "Reject all" sind gleich prominent (TDDDG/DSK).
 * - Footer-Link "Cookie settings" feuert CONSENT_OPEN_EVENT → Banner geht
 *   mit aufgeklappten Einstellungen wieder auf.
 * - Kategorien Statistics (GA4, Clarity) und Marketing (Meta Pixel) gehen
 *   unabhängig voneinander an applyTrackingConsent(): GTM lädt, sobald
 *   eine der beiden erteilt ist; Widerruf setzt den jeweiligen Consent auf
 *   denied und löscht die Cookies der Kategorie (kein Reload nötig).
 * - Geladen wird der GTM-Container (GA4, Clarity, Meta Pixel als Tags
 *   darin), siehe src/lib/analytics.ts.
 * - Conversion-Events hängen an den CustomEvents der Formulare
 *   (ziri:contact:submitted, ziri:training:submitted); die Formulare selbst
 *   bleiben unangetastet (CLAUDE.md). trackEvent() sendet nur, wenn GTM
 *   geladen und Statistics oder Marketing erteilt ist.
 */

function applyChoices(choices: ConsentChoices) {
  applyTrackingConsent({
    statistics: !!choices.statistics,
    marketing: !!choices.marketing,
  });
}

/* Deutsche Texte für deutschsprachige Landingpages (aktuell /website-umzug) */
const GERMAN_PATHS = ["/website-umzug"];

const TEXT = {
  en: {
    title: "Privacy settings",
    body: "We would like to use Google Analytics and Microsoft Clarity to see how people use this site, and the Meta Pixel and LinkedIn Insight Tag to measure which of our ads bring sign-ups. They only run if you allow it. You can change your choice any time via Cookie settings in the footer.",
    policy: "Privacy Policy",
    legend: "Consent categories",
    alwaysOn: "Always on",
    reject: "Reject all",
    accept: "Accept all",
    save: "Save my choice",
    settings: "Settings",
    categories: {} as Record<string, { label: string; description: string }>,
  },
  de: {
    title: "Datenschutz-Einstellungen",
    body: "Wir würden gern Google Analytics und Microsoft Clarity nutzen, um zu sehen, wie diese Seite genutzt wird, und das Meta Pixel und den LinkedIn Insight Tag, um zu messen, welche Anzeigen Anfragen bringen. Sie laufen nur, wenn du zustimmst. Du kannst deine Wahl jederzeit über Cookie-Einstellungen im Footer ändern.",
    policy: "Datenschutzerklärung",
    legend: "Einwilligungs-Kategorien",
    alwaysOn: "Immer aktiv",
    reject: "Alle ablehnen",
    accept: "Alle akzeptieren",
    save: "Auswahl speichern",
    settings: "Einstellungen",
    categories: {
      necessary: {
        label: "Notwendig",
        description:
          "Speichert nur deine Einwilligungs-Auswahl in deinem Browser. Kein Cookie, nichts wird an uns gesendet.",
      },
      statistics: {
        label: "Statistik",
        description:
          "Google Analytics 4 und Microsoft Clarity. Zeigen uns, wie Besucher die Seite nutzen (inklusive anonymisierter Sitzungsaufzeichnungen und Heatmaps) und welche Kampagnen Besucher und Anfragen bringen. Setzen Cookies und laufen nur mit deiner Zustimmung.",
      },
      marketing: {
        label: "Marketing",
        description:
          "Meta Pixel und LinkedIn Insight Tag. Messen, welche Anzeigen Anfragen bringen, und zeigen unsere Anzeigen Menschen, die diese Seite besucht haben. Setzen Cookies und laufen nur mit deiner Zustimmung.",
      },
    } as Record<string, { label: string; description: string }>,
  },
};

export function ConsentBanner() {
  const pathname = usePathname();
  const t = GERMAN_PATHS.some((path) => pathname?.startsWith(path)) ? TEXT.de : TEXT.en;
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasStoredChoice, setHasStoredChoice] = useState(false);
  const [draft, setDraft] = useState<ConsentChoices>(() => allChoices(false));
  const cardRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const settingsId = useId();

  // Erstbesuch prüfen + gespeicherte Wahl anwenden
  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setHasStoredChoice(true);
      setDraft({ ...allChoices(false), ...stored.choices });
      applyChoices(stored.choices);
    } else {
      setOpen(true);
    }
  }, []);

  // Footer-Link "Cookie settings"
  useEffect(() => {
    const handleOpen = () => {
      const stored = readConsent();
      setDraft({ ...allChoices(false), ...(stored?.choices ?? {}) });
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setShowSettings(true);
      setOpen(true);
      // Fokus in die Karte, sobald sie gerendert ist
      window.requestAnimationFrame(() => cardRef.current?.focus());
    };
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  // Conversion-Events zentral anhängen
  useEffect(() => {
    const onContact = () => trackEvent("generate_lead", { form_name: "contact" });
    const onTraining = (event: Event) => {
      const detail = (event as CustomEvent<{ slug?: string; role?: string }>)
        .detail;
      const slug = detail?.slug;
      trackEvent("generate_lead", { form_name: "training", training: slug });
      // Meta-Lead hängt in GTM an qualified_lead: nur In-house-Anmeldungen
      // zählen als Conversion. Die Antwort selbst geht nicht an Meta.
      if (detail?.role && TRAINING_QUALIFIED_ROLES.includes(detail.role)) {
        trackEvent("qualified_lead", { form_name: "training", training: slug });
      }
    };
    // Website-Umzug-Anfragen sind direkte Anfragen: zählen auch als Meta-Lead
    const onWebsiteUmzug = () => {
      trackEvent("generate_lead", { form_name: "website_umzug" });
      trackEvent("qualified_lead", { form_name: "website_umzug" });
    };
    window.addEventListener("ziri:contact:submitted", onContact);
    window.addEventListener("ziri:training:submitted", onTraining);
    window.addEventListener("ziri:website-umzug:submitted", onWebsiteUmzug);
    return () => {
      window.removeEventListener("ziri:contact:submitted", onContact);
      window.removeEventListener("ziri:training:submitted", onTraining);
      window.removeEventListener("ziri:website-umzug:submitted", onWebsiteUmzug);
    };
  }, []);

  const save = useCallback((choices: ConsentChoices) => {
    const record = writeConsent(choices);
    applyChoices(record.choices);
    setDraft({ ...allChoices(false), ...record.choices });
    setHasStoredChoice(true);
    setOpen(false);
    setShowSettings(false);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: record.choices }));
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target && document.contains(target)) target.focus();
  }, []);

  // Escape schließt nur, wenn schon eine Wahl existiert (sonst muss gewählt werden)
  useEffect(() => {
    if (!open || !hasStoredChoice) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setShowSettings(false);
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      if (target && document.contains(target)) target.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasStoredChoice]);

  if (!open) return null;

  return (
    <div
      className={styles.card}
      data-theme="light-primary"
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
    >
      <p className={styles.title} id={titleId}>
        {t.title}
      </p>
      <p className={styles.text} id={descriptionId}>
        {t.body} <Link href="/privacy#analytics">{t.policy}</Link>
      </p>

      {showSettings && (
        <fieldset className={styles.settings} id={settingsId}>
          <legend className={styles.srOnly}>{t.legend}</legend>
          {CONSENT_CATEGORIES.map((category) => {
            const checked = category.required ? true : !!draft[category.id];
            return (
              <label className={styles.category} key={category.id}>
                <span className={styles.categoryText}>
                  <span className={styles.categoryLabel}>
                    {t.categories[category.id]?.label ?? category.label}
                    {category.required && (
                      <span className={styles.categoryBadge}>{t.alwaysOn}</span>
                    )}
                  </span>
                  <span className={styles.categoryDescription}>
                    {t.categories[category.id]?.description ?? category.description}
                  </span>
                </span>
                <input
                  className={styles.switch}
                  type="checkbox"
                  role="switch"
                  checked={checked}
                  disabled={category.required}
                  aria-checked={checked}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [category.id]: event.target.checked,
                    }))
                  }
                />
              </label>
            );
          })}
        </fieldset>
      )}

      <div className={styles.actions}>
        <button
          className={styles.choice}
          type="button"
          onClick={() => save(allChoices(false))}
        >
          {t.reject}
        </button>
        <button
          className={styles.choice}
          type="button"
          onClick={() => save(allChoices(true))}
        >
          {t.accept}
        </button>
      </div>
      <div className={styles.secondary}>
        {showSettings ? (
          <button
            className={styles.textButton}
            type="button"
            onClick={() => save(draft)}
          >
            {t.save}
          </button>
        ) : (
          <button
            className={styles.textButton}
            type="button"
            aria-expanded={false}
            aria-controls={settingsId}
            onClick={() => {
              setShowSettings(true);
              // Button verschwindet: Fokus auf den ersten wählbaren Schalter
              window.requestAnimationFrame(() =>
                cardRef.current
                  ?.querySelector<HTMLInputElement>("input:not(:disabled)")
                  ?.focus(),
              );
            }}
          >
            {t.settings}
          </button>
        )}
      </div>
    </div>
  );
}
