"use client";

import { useState, type FormEvent } from "react";
import styles from "./book-call.module.css";

type Status = "idle" | "submitting" | "error";

const bottlenecks = [
  { value: "deals-go-quiet", label: "Deals stall, then “we went another direction.”" },
  { value: "sales-re-explains", label: "Sales re-explains what we do on every call." },
  { value: "cac-climbing", label: "Traffic converts poorly while CAC keeps climbing." },
  { value: "price-pressure", label: "We get negotiated down because we look comparable to cheaper options." },
  { value: "relaunch", label: "We're planning a relaunch and want it built on more than design." },
] as const;

const dealSizes = [
  { value: "<10k", label: "Under €10k" },
  { value: "10-100k", label: "€10-100k" },
  { value: "100k-1m", label: "€100k-1M" },
  { value: "1m+", label: "€1M+" },
] as const;

const timelines = [
  { value: "now", label: "Now" },
  { value: "1-3-months", label: "Next 1-3 months" },
  { value: "this-year", label: "This year" },
  { value: "exploring", label: "Exploring" },
] as const;

/**
 * Qualification/contact form — GDPR-friendly:
 * - Datenminimierung, Pflicht-Consent, Honeypot statt Captcha,
 *   keine Cookies, keine Third-Party-Embeds.
 * - Erfolgreiche Submits feuern das CustomEvent "ziri:contact:submitted"
 *   auf window — Tracking (z. B. GA4) hängt sich dort an, ohne diese
 *   Komponente anzufassen. Siehe CLAUDE.md: neue Tracking-Tools müssen
 *   die Privacy-Seite mitziehen.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [done, setDone] = useState(false);

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bottleneck: data.get("bottleneck"),
          dealSize: data.get("deal_size"),
          timeline: data.get("timeline"),
          email: data.get("email"),
          website: data.get("website"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          company_website_2: data.get("company_website_2"),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));

      setDone(true);
      window.dispatchEvent(new CustomEvent("ziri:contact:submitted"));
    } catch {
      setStatus("error");
    }
  };

  if (done) {
    return (
      <div className={styles.formSuccess} role="status">
        <h3>Received.</h3>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot — für Menschen unsichtbar */}
      <label className={styles.honeypot} aria-hidden="true">
        Leave this empty
        <input
          name="company_website_2"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <fieldset className={styles.formSection}>
        <p className={styles.formQuestion}>
          What&rsquo;s costing you the most right now?
        </p>
        <div className={styles.selectWrap}>
          <select name="bottleneck" required defaultValue="">
            <option value="" disabled>
              Choose what fits best
            </option>
            {bottlenecks.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <p className={styles.formQuestion}>
          Typical contract value per customer?
        </p>
        <div
          className={styles.segmented}
          role="radiogroup"
          aria-label="Typical deal size"
        >
          {dealSizes.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="deal_size"
                value={option.value}
                required
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <p className={styles.formQuestion}>When do you want to start?</p>
        <div
          className={styles.segmented}
          role="radiogroup"
          aria-label="Timeline"
        >
          {timelines.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="timeline"
                value={option.value}
                required
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <div className={styles.formGrid}>
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
          <label className={styles.formField}>
            <span>
              Company website <em>(Optional)</em>
            </span>
            <input
              name="website"
              type="text"
              inputMode="url"
              placeholder="yourcompany.com"
              maxLength={320}
            />
          </label>
          <label className={`${styles.formField} ${styles.formFieldFull}`}>
            <span>
              Anything you&rsquo;d like to tell us about your project?{" "}
              <em>(Optional)</em>
            </span>
            <textarea
              name="message"
              rows={4}
              maxLength={5000}
              placeholder="A competitor you keep losing to, a page that isn't working…"
            />
          </label>
        </div>
      </fieldset>

      <label className={styles.formConsent}>
        <input name="consent" type="checkbox" required />
        <span>
          I agree that ZIRI may use my details to respond to my inquiry.
          Details in the <a href="/privacy">privacy policy</a>.
        </span>
      </label>

      <div className={styles.formFooter}>
        <button
          className={styles.formSubmit}
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Schedule a consultation"}
        </button>
        {status === "error" ? (
          <p className={styles.formError} role="alert">
            Something went wrong sending the form. Please try again, or email
            us directly.
          </p>
        ) : null}
      </div>
    </form>
  );
}
