"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { TRAINING_DEAL_SIZES, TRAINING_ROLES } from "@/data/trainings";
import styles from "./book-call.module.css";

type Status = "idle" | "submitting" | "error";

const UTM_KEYS = ["utm_source", "utm_campaign", "utm_content"] as const;
type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/**
 * Sign-up-Formular für die Webinar-Lead-Magnets (/training/[slug]).
 * Gleiche GDPR-Invarianten wie das Kontaktformular (siehe CLAUDE.md):
 * Datenminimierung, Pflicht-Consent, Honeypot statt Captcha, keine
 * Cookies, keine Third-Party-Embeds.
 *
 * - UTM-Parameter (utm_source/campaign/content) werden aus der URL
 *   gelesen und mitgeschickt, für spätere Ad-Auswertung.
 * - Erfolgreiche Submits feuern das CustomEvent "ziri:training:submitted"
 *   mit { slug } auf window und leiten dann auf die Thank-you-Seite.
 *   Tracking (z. B. Meta Pixel) dort anhängen, nicht hier, und vorher
 *   Privacy Policy + Consent nachziehen.
 */
export function TrainingSignupForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [utm, setUtm] = useState<Utm>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const found: Utm = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) found[key] = value.slice(0, 200);
    }
    setUtm(found);
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
      const response = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          training: data.get("training"),
          firstName: data.get("first_name"),
          email: data.get("email"),
          website: data.get("website"),
          dealSize: data.get("deal_size"),
          role: data.get("role"),
          utm_source: data.get("utm_source"),
          utm_campaign: data.get("utm_campaign"),
          utm_content: data.get("utm_content"),
          consent: data.get("consent") === "on",
          company_website_2: data.get("company_website_2"),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));

      window.dispatchEvent(
        new CustomEvent("ziri:training:submitted", { detail: { slug } }),
      );
      router.push(`/training/${slug}/thanks`);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot, für Menschen unsichtbar */}
      <label className={styles.honeypot} aria-hidden="true">
        Leave this empty
        <input
          name="company_website_2"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      <input type="hidden" name="training" value={slug} />
      {UTM_KEYS.map((key) => (
        <input type="hidden" name={key} value={utm[key] ?? ""} key={key} />
      ))}

      <fieldset className={styles.formSection}>
        <div className={styles.formGrid}>
          <label className={styles.formField}>
            <span>First name</span>
            <input
              name="first_name"
              type="text"
              autoComplete="given-name"
              required
              maxLength={100}
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
          <label className={`${styles.formField} ${styles.formFieldFull}`}>
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
          {TRAINING_DEAL_SIZES.map((option) => (
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
        <p className={styles.formQuestion}>What&rsquo;s your role?</p>
        <div
          className={styles.segmented}
          role="radiogroup"
          aria-label="Your role"
        >
          {TRAINING_ROLES.map((option) => (
            <label key={option.value}>
              <input type="radio" name="role" value={option.value} required />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.formConsent}>
        <input name="consent" type="checkbox" required />
        <span>
          I agree that ZIRI may use my details to send me this training and
          follow up with me about it. Details in the{" "}
          <a href="/privacy#training">privacy policy</a>.
        </span>
      </label>

      <div className={styles.formFooter}>
        <button
          className={styles.formSubmit}
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send me the training"}
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
