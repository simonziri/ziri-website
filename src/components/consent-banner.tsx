"use client";

import Link from "next/link";
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
import {
  loadGoogleAnalytics,
  revokeGoogleAnalytics,
  trackEvent,
} from "@/lib/analytics";
import styles from "./consent-banner.module.css";

/*
 * Consent-Banner + zentrale Analytics-Steuerung (in layout.tsx eingehängt,
 * gilt damit für alle Seiten).
 *
 * - Erstbesuch (keine gültige Wahl in localStorage): Banner erscheint.
 *   "Accept all" und "Reject all" sind gleich prominent (TDDDG/DSK).
 * - Footer-Link "Cookie settings" feuert CONSENT_OPEN_EVENT → Banner geht
 *   mit aufgeklappten Einstellungen wieder auf.
 * - Statistics granted → loadGoogleAnalytics(); später widerrufen →
 *   revokeGoogleAnalytics() (Consent denied + _ga*-Cookies löschen, kein
 *   Reload nötig).
 * - GA4 Measurement-ID kommt aus NEXT_PUBLIC_GA_MEASUREMENT_ID (siehe
 *   src/lib/analytics.ts). Ohne ID läuft das Banner trotzdem, lädt aber nie
 *   ein Script.
 * - Conversion-Events hängen an den CustomEvents der Formulare
 *   (ziri:contact:submitted, ziri:training:submitted); die Formulare selbst
 *   bleiben unangetastet (CLAUDE.md). trackEvent() sendet nur, wenn
 *   Statistics erteilt und gtag geladen ist.
 */

function applyChoices(choices: ConsentChoices) {
  if (choices.statistics) loadGoogleAnalytics();
  else revokeGoogleAnalytics();
  // Platz für weitere Kategorien, z. B. if (choices.marketing) loadMetaPixel();
}

export function ConsentBanner() {
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
      const slug = (event as CustomEvent<{ slug?: string }>).detail?.slug;
      trackEvent("generate_lead", { form_name: "training", training: slug });
    };
    window.addEventListener("ziri:contact:submitted", onContact);
    window.addEventListener("ziri:training:submitted", onTraining);
    return () => {
      window.removeEventListener("ziri:contact:submitted", onContact);
      window.removeEventListener("ziri:training:submitted", onTraining);
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
        Privacy settings
      </p>
      <p className={styles.text} id={descriptionId}>
        We would like to use Google Analytics to see how people use this site
        and which campaigns bring visitors. It only runs if you allow it. You
        can change your choice any time via Cookie settings in the footer.{" "}
        <Link href="/privacy#analytics">Privacy Policy</Link>
      </p>

      {showSettings && (
        <fieldset className={styles.settings} id={settingsId}>
          <legend className={styles.srOnly}>Consent categories</legend>
          {CONSENT_CATEGORIES.map((category) => {
            const checked = category.required ? true : !!draft[category.id];
            return (
              <label className={styles.category} key={category.id}>
                <span className={styles.categoryText}>
                  <span className={styles.categoryLabel}>
                    {category.label}
                    {category.required && (
                      <span className={styles.categoryBadge}>Always on</span>
                    )}
                  </span>
                  <span className={styles.categoryDescription}>
                    {category.description}
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
          Reject all
        </button>
        <button
          className={styles.choice}
          type="button"
          onClick={() => save(allChoices(true))}
        >
          Accept all
        </button>
      </div>
      <div className={styles.secondary}>
        {showSettings ? (
          <button
            className={styles.textButton}
            type="button"
            onClick={() => save(draft)}
          >
            Save my choice
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
            Settings
          </button>
        )}
      </div>
    </div>
  );
}
