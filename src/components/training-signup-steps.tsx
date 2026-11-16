"use client";

import { useEffect, useState, type FormEvent } from "react";
import { TrainingLoomForm } from "@/components/training-loom-form";
import { TRAINING_EMAIL_STORAGE_KEY } from "@/data/trainings";
import { submitOrSimulate } from "@/lib/form-simulation";
import formStyles from "./book-call.module.css";
import styles from "@/app/training/training.module.css";

/**
 * Thank-you-Seite für Trainings, die schon online sind (Simon 14.11., nach
 * Logan Lyles' "two-step sign-up flow"): Das Video kommt per Mail, hier folgen
 * ein paar Fragen und am Ende das Angebot eines Gratis-Audits.
 *
 *   1 Firmengröße -> 2 Umsatz -> 3 Warum / was nervt (frei, Pflicht: ohne
 *   Antwort käme eh kein Call zustande, Simon 14.11.)
 *   -> 4 Audit ja/nein -> ja: "wir melden uns" + optionales Kontextfeld
 *                       -> nein: Loom-Breakdown-Formular (ohne Call)
 *
 * - Adresse aus sessionStorage (Anmeldung, gleicher Tab), nie in der URL.
 *   Fehlt sie, fragt Schritt 4 danach.
 * - Antworten gehen erst bei Schritt 4 raus (/api/training/interest, kind
 *   "survey"), der Kontext danach als kind "audit-context".
 * - Privacy Policy Abschnitt 4 beschreibt diese Fragen. Bei Änderungen mitziehen.
 */

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"] as const;

const REVENUE = [
  "Under $1M",
  "$1M–$10M",
  "$10M–$50M",
  "$50M–$250M",
  "$250M+",
] as const;

type Step = "size" | "revenue" | "pain" | "audit" | "yes" | "no";

const STEP_NUMBER: Record<Step, number> = {
  size: 1,
  revenue: 2,
  pain: 3,
  audit: 4,
  yes: 4,
  no: 4,
};

export function TrainingSignupSteps({
  slug,
  senderEmail,
}: {
  slug: string;
  senderEmail: string;
}) {
  const [step, setStep] = useState<Step>("size");
  const [size, setSize] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<string | null>(null);
  const [pain, setPain] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [contextSent, setContextSent] = useState(false);

  useEffect(() => {
    try {
      setEmail(sessionStorage.getItem(TRAINING_EMAIL_STORAGE_KEY));
    } catch {
      setEmail(null);
    }
    setCheckedStorage(true);
  }, []);

  const post = (body: Record<string, unknown>) =>
    submitOrSimulate("/api/training/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ training: slug, source: "thanks", ...body }),
    }).then((response) => {
      if (!response.ok) throw new Error(String(response.status));
    });

  const answerAudit = async (wantsAudit: boolean, form?: HTMLFormElement) => {
    let address = email;
    if (!address && form) {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      address = String(new FormData(form).get("email") ?? "");
      setEmail(address);
    }
    setSending(true);
    setError(false);
    try {
      await post({
        kind: "survey",
        email: address,
        company_size: size,
        revenue,
        pain,
        audit: wantsAudit ? "yes" : "no",
      });
      setStep(wantsAudit ? "yes" : "no");
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const sendContext = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const context = String(new FormData(event.currentTarget).get("context") ?? "").trim();
    if (!context) return;
    setSending(true);
    setError(false);
    try {
      await post({ kind: "audit-context", email, context });
      setContextSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (!checkedStorage) return null;

  const choices = (
    options: readonly string[],
    current: string | null,
    pick: (value: string) => void,
  ) => (
    <div className={styles.choiceList}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={styles.choice}
          aria-pressed={current === option}
          onClick={() => pick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <p className={styles.thanksNote}>
        The training is on its way to your inbox from <strong>{senderEmail}</strong>.
        Not there in a few minutes? Check your spam folder.
      </p>

      <p className={styles.stepTag}>{STEP_NUMBER[step]}/4</p>

      {step === "size" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <h1 id="step-title">One last step: how many people work at your company?</h1>
          {choices(COMPANY_SIZES, size, (value) => {
            setSize(value);
            setStep("revenue");
          })}
        </section>
      ) : null}

      {step === "revenue" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <h1 id="step-title">Roughly what&rsquo;s your company&rsquo;s annual revenue?</h1>
          {choices(REVENUE, revenue, (value) => {
            setRevenue(value);
            setStep("pain");
          })}
          <button type="button" className={styles.stepBack} onClick={() => setStep("size")}>
            Back
          </button>
        </section>
      ) : null}

      {step === "pain" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <h1 id="step-title">What made you sign up? What&rsquo;s bugging you about your website right now?</h1>
          <p>
            Feel free to vent. The more honest, the better we can help.
          </p>
          <form
            className={formStyles.form}
            onSubmit={(event) => {
              event.preventDefault();
              if (pain.trim().length < 3) return;
              setStep("audit");
            }}
          >
            <label className={formStyles.formField}>
              <span className={styles.visuallyHidden}>Your answer</span>
              <textarea
                required
                minLength={3}
                rows={5}
                maxLength={3000}
                value={pain}
                onChange={(event) => setPain(event.currentTarget.value)}
                placeholder="e.g. We get traffic, but hardly any demo requests, and nobody agrees on why…"
              />
            </label>
            <div className={formStyles.formFooter}>
              <button className={formStyles.formSubmit} type="submit">
                Next
              </button>
            </div>
          </form>
          <button type="button" className={styles.stepBack} onClick={() => setStep("revenue")}>
            Back
          </button>
        </section>
      ) : null}

      {step === "audit" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          {/* Nach Logan Lyles: benanntes Angebot, auf die Antworten bezogen, mit
              "was du bekommst"-Punkten. ENTWURF, Punkte von Simon prüfen lassen. */}
          <h1 id="step-title">Based on your answers, we can do a free audit of your website.</h1>
          <p>A plan for your site, walked through with you on a short call:</p>
          <ul className={styles.bullets}>
            <li>Where your site loses buyers, and which people in the buying group it doesn&rsquo;t speak to</li>
            <li>What your competitors say that you don&rsquo;t, and where you all sound the same</li>
            <li>Clear next steps, lowest effort and highest impact first</li>
          </ul>
          <p>Want it?</p>
          <form
            className={formStyles.form}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void answerAudit(true, event.currentTarget);
            }}
          >
            {email ? null : (
              <label className={formStyles.formField}>
                <span>Work email you signed up with</span>
                <input name="email" type="email" autoComplete="email" required maxLength={320} />
              </label>
            )}
            <div className={styles.auditActions}>
              <button className={formStyles.formSubmit} type="submit" disabled={sending}>
                {sending ? "Sending…" : "Yes, I want my free audit"}
              </button>
              <button
                type="button"
                className={styles.calendarSkip}
                disabled={sending}
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  void answerAudit(false, form ?? undefined);
                }}
              >
                No thanks
              </button>
            </div>
            {error ? (
              <p className={formStyles.formError} role="alert">
                Something went wrong. Please try again, or just reply to the
                training email.
              </p>
            ) : null}
          </form>
        </section>
      ) : null}

      {step === "yes" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <h1 id="step-title">Great. I&rsquo;ll get back to you by email.</h1>
          {contextSent ? (
            <p className={styles.thanksNote}>Thanks, that helps. Talk soon.</p>
          ) : (
            <form className={formStyles.form} onSubmit={sendContext}>
              <label className={formStyles.formField}>
                <span>Anything I should know before we talk? (optional)</span>
                <textarea
                  name="context"
                  rows={4}
                  maxLength={3000}
                  placeholder="Which page or site, what you've tried, what's coming up…"
                />
              </label>
              <div className={formStyles.formFooter}>
                <button className={formStyles.formSubmit} type="submit" disabled={sending}>
                  {sending ? "Sending…" : "Send"}
                </button>
                {error ? (
                  <p className={formStyles.formError} role="alert">
                    Something went wrong. Please try again, or just reply to the
                    training email.
                  </p>
                ) : null}
              </div>
            </form>
          )}
          <p className={styles.thanksNote}>— Simon</p>
        </section>
      ) : null}

      {step === "no" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <h1 id="step-title">No problem. Want a short video breakdown instead? No call needed.</h1>
          <div
            className={styles.loomCard}
            role="region"
            aria-labelledby="loom-title"
            data-theme="light-primary"
          >
            <h2 id="loom-title">Send us one page, we send you a video</h2>
            <p>
              We record a short video breakdown of the potential we see, based
              on your page, your competitors, your market and what customers say
              publicly. You get it by email.
            </p>
            <TrainingLoomForm slug={slug} revealEmail source="thanks" />
          </div>
        </section>
      ) : null}
    </>
  );
}
