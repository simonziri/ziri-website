"use client";

import { useState, type FormEvent } from "react";
import styles from "./book-call.module.css";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * GDPR-friendly contact form:
 * - Datenminimierung: nur Name, E-Mail, Nachricht.
 * - Explizite Einwilligung (Pflicht-Checkbox), keine Cookies, kein
 *   Third-Party-Embed, Honeypot statt Captcha.
 * - Tracking-Seam: bei Erfolg feuert ein CustomEvent
 *   "ziri:contact:submitted" auf window — Analytics kann sich dort
 *   anhängen, ohne diese Komponente anzufassen.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));

      form.reset();
      setStatus("success");
      window.dispatchEvent(new CustomEvent("ziri:contact:submitted"));
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.formSuccess} role="status">
        <h3>Thanks — your message is on its way.</h3>
        <p>We usually reply within one business day.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
      <div className={styles.formRow}>
        <label className={styles.formField}>
          <span>Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={200}
          />
        </label>
        <label className={styles.formField}>
          <span>Work email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
          />
        </label>
      </div>

      <label className={styles.formField}>
        <span>What are you working on?</span>
        <textarea name="message" rows={6} required maxLength={5000} />
      </label>

      {/* Honeypot — für Menschen unsichtbar, Bots füllen es aus */}
      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <label className={styles.formConsent}>
        <input name="consent" type="checkbox" required />
        <span>
          I agree that ZIRI may use my details to respond to my inquiry. No
          newsletter, no tracking — details in the{" "}
          <a href="/privacy">privacy policy</a>.
        </span>
      </label>

      <div className={styles.formFooter}>
        <button
          className={styles.formSubmit}
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        {status === "error" ? (
          <p className={styles.formError} role="alert">
            Something went wrong — please try again or email us directly.
          </p>
        ) : null}
      </div>
    </form>
  );
}
