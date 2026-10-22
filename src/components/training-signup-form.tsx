"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { TRAINING_EMAIL_STORAGE_KEY, TRAINING_ROLES } from "@/data/trainings";
import { isFreeEmail, WORK_EMAIL_MESSAGE } from "@/lib/work-email";
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
 * - Nur Firmen-Adressen (src/lib/work-email.ts), Server prüft erneut.
 * - Die Adresse wird für die Thank-you-Seite in sessionStorage gelegt
 *   (Interessen-Formular dort), nie in URL oder Cookie.
 */
export function TrainingSignupForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [utm, setUtm] = useState<Utm>({});
  const [emailError, setEmailError] = useState<string | null>(null);

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
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const workEmailError =
      emailInput.value && isFreeEmail(emailInput.value)
        ? WORK_EMAIL_MESSAGE
        : null;
    emailInput.setCustomValidity(workEmailError ?? "");
    setEmailError(workEmailError);
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
          email: data.get("email"),
          role: data.get("role"),
          utm_source: data.get("utm_source"),
          utm_campaign: data.get("utm_campaign"),
          utm_content: data.get("utm_content"),
          consent: data.get("consent") === "on",
          newsletter: data.get("newsletter") === "on",
          company_website_2: data.get("company_website_2"),
        }),
      });
      if (!response.ok) {
        const result: { error?: string } = await response
          .json()
          .catch(() => ({}));
        if (result.error === "work_email") {
          setEmailError(WORK_EMAIL_MESSAGE);
          setStatus("idle");
          return;
        }
        throw new Error(String(response.status));
      }

      try {
        sessionStorage.setItem(
          TRAINING_EMAIL_STORAGE_KEY,
          String(data.get("email") ?? ""),
        );
      } catch {
        // Kein Storage (privates Fenster o. ä.): Thank-you-Seite fragt nach.
      }

      window.dispatchEvent(
        new CustomEvent("ziri:training:submitted", {
          detail: { slug, role: String(data.get("role") ?? "") },
        }),
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
        <label className={styles.formField}>
          <span>Work email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "training-email-error" : undefined}
            onChange={(event) => {
              if (emailError) {
                event.currentTarget.setCustomValidity("");
                setEmailError(null);
              }
            }}
          />
        </label>
        {emailError ? (
          <p
            className={styles.formError}
            id="training-email-error"
            role="alert"
          >
            {emailError}
          </p>
        ) : null}
      </fieldset>

      <fieldset className={styles.formSection}>
        <p className={styles.formQuestion}>What describes you best?</p>
        <div
          className={styles.segmented}
          role="radiogroup"
          aria-label="What describes you best"
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

      <label className={styles.formConsent}>
        <input name="newsletter" type="checkbox" />
        <span>
          Optional: also send me ZIRI&rsquo;s newsletter. You&rsquo;ll get a
          confirmation e-mail first. Unsubscribe any time.
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
