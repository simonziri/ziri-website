"use client";

import { useEffect, useState, type FormEvent } from "react";
import { TRAINING_EMAIL_STORAGE_KEY } from "@/data/trainings";
import styles from "./book-call.module.css";

type Status = "idle" | "submitting" | "sent" | "error";

/** "jane@acme.com" -> "acme.com" (nur Firmen-Adressen kommen hier an) */
const domainFromEmail = (email: string | null) =>
  email?.split("@")[1]?.toLowerCase() ?? undefined;

/**
 * Formular auf der Thank-you-Seite: Gratis-Loom-Review einer Seite
 * (seit 03.11., ersetzt die Interessen-Frage). Erstmal für alle, ohne
 * Qualifizierung (Simons Ansage 03.11.; später evtl. nur für Nicht-Agenturen).
 *
 * - Adresse aus sessionStorage (von der Anmeldung, gleicher Tab). Ist sie da,
 *   gibt es kein E-Mail-Feld, und die Seiten-URL ist mit der Firmen-Domain
 *   vorbelegt (editierbar). Fehlt sie, wird das E-Mail-Feld eingeblendet.
 * - Ziel: /api/training/interest mit kind "loom".
 */
export function TrainingLoomForm({ slug }: { slug: string }) {
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
          kind: "loom",
          training: slug,
          email: storedEmail ?? data.get("email"),
          page_url: data.get("page_url"),
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
        <h3>Got it, thank you.</h3>
        <p>
          We&rsquo;ll take a look and get back to you by email, usually within
          a few working days.
        </p>
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
        <label className={styles.formField}>
          <span>Which page should we look at?</span>
          <input
            name="page_url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="yourcompany.com/demo"
            defaultValue={domainFromEmail(storedEmail)}
            required
            maxLength={500}
          />
        </label>
      </fieldset>

      <div className={styles.formFooter}>
        <button
          className={styles.formSubmit}
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Request my page review"}
        </button>
        {status === "error" ? (
          <p className={styles.formError} role="alert">
            Something went wrong. Please try again, or just reply to the
            confirmation email with your page.
          </p>
        ) : null}
      </div>
    </form>
  );
}
