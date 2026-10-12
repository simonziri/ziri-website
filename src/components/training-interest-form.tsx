"use client";

import { useEffect, useState, type FormEvent } from "react";
import { TRAINING_EMAIL_STORAGE_KEY } from "@/data/trainings";
import styles from "./book-call.module.css";

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * Formular auf der Thank-you-Seite: "What topic is burning most right now?"
 * Bewusst nur ein Textfeld.
 *
 * - Die Adresse kommt aus sessionStorage (von der Anmeldung, gleicher Tab).
 *   Fehlt sie, wird das E-Mail-Feld eingeblendet.
 * - Ziel: /api/training/interest (Pipedrive-Notiz + Benachrichtigung).
 */
export function TrainingInterestForm({
  slug,
  labelledBy,
}: {
  slug: string;
  /** id der Überschrift, die die Frage stellt (Label des Textfelds) */
  labelledBy: string;
}) {
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    try {
      setStoredEmail(sessionStorage.getItem(TRAINING_EMAIL_STORAGE_KEY));
    } catch {
      setStoredEmail(null);
    }
    setCheckedStorage(true);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);

    setStatus("submitting");
    try {
      const response = await fetch("/api/training/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          training: slug,
          email: storedEmail ?? data.get("email"),
          problem: data.get("problem"),
          company_website_2: data.get("company_website_2"),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className={styles.formSuccess} role="status">
        <h3>Thank you, that helps a lot.</h3>
        <p>I&rsquo;ll make sure the training covers it.</p>
      </div>
    );
  }

  // Vor dem Storage-Check nichts rendern, sonst blitzt das E-Mail-Feld auf.
  if (!checkedStorage) return null;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.honeypot} aria-hidden="true">
        Leave this empty
        <input
          name="company_website_2"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      {storedEmail ? null : (
        <fieldset className={styles.formSection}>
          <label className={styles.formField}>
            <span>Work email you signed up with</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
            />
          </label>
        </fieldset>
      )}

      <fieldset className={styles.formSection}>
        <div className={styles.formField}>
          <textarea
            name="problem"
            rows={4}
            maxLength={2000}
            required
            aria-labelledby={labelledBy}
          />
        </div>
      </fieldset>

      <div className={styles.formFooter}>
        <button
          className={styles.formSubmit}
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send"}
        </button>
        {status === "error" ? (
          <p className={styles.formError} role="alert">
            Something went wrong. Please try again, or just reply to the
            confirmation email.
          </p>
        ) : null}
      </div>
    </form>
  );
}
