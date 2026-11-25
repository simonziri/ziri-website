"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuditCalendar, type CalendarEvent } from "@/components/audit-calendar";
import { TrainingLoomForm } from "@/components/training-loom-form";
import { TRAINING_ROLES } from "@/data/trainings";
import { submitOrSimulate } from "@/lib/form-simulation";
import {
  excludedFromVideo,
  qualifiesForCalendar,
  readProfile,
  saveProfile,
  type VisitorProfile,
} from "@/lib/visitor-profile";
import { isFreeEmail, WORK_EMAIL_MESSAGE } from "@/lib/work-email";
import formStyles from "./book-call.module.css";
import styles from "@/app/training/training.module.css";

/**
 * Fragen + Angebot (Gratis-Audit / Video-Breakdown), Simon 23.11.
 *
 * Drei Varianten, gleiche Fragen:
 * - "thanks": Thank-you-Seite nach der Anmeldung. Fragen -> Audit ja/nein.
 *   Ja -> Kalender (Nicht-Agentur, ab $1M) oder "wir melden uns".
 *   Nein -> Video-Breakdown, außer Agenturen unter $1M.
 * - "audit": Modal auf der Watch-Seite. Fragen -> direkt Kalender / "wir melden uns".
 * - "loom": Modal auf der Watch-Seite. Fragen -> Seite fürs Video -> "Auch ein
 *   Gratis-Audit?" -> Kalender / "wir melden uns".
 *
 * Was schon bekannt ist (lib/visitor-profile: dieser Tab, oder mit Einwilligung
 * "Remember my answers" auch frühere Besuche), wird nicht noch mal gefragt.
 * Die Benachrichtigung an ZIRI geht beim "Ja" raus, auch wenn niemand bucht.
 */

export type OfferVariant = "thanks" | "audit" | "loom";

type Step =
  | "contact"
  | "size"
  | "revenue"
  | "pain"
  | "audit"
  | "loom"
  | "upsell"
  | "book"
  | "yes"
  | "no"
  | "done";

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"] as const;

const REVENUE = ["Under $1M", "$1M–$10M", "$10M–$50M", "$50M–$250M", "$250M+"] as const;

export function calendarPrefill(p: VisitorProfile) {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
  const notes = [
    p.company ? `Company: ${p.company}` : null,
    p.size ? `Company size: ${p.size}` : null,
    p.revenue ? `Annual revenue: ${p.revenue}` : null,
    p.pain?.trim() ? `What's bugging them: ${p.pain.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    name: name || undefined,
    email: p.email || undefined,
    notes: notes ? notes.slice(0, 1500) : undefined,
  };
}

export function AuditOfferFlow({
  slug,
  variant,
  onStepChange,
  onCalendarEvent,
}: {
  slug: string;
  variant: OfferVariant;
  onStepChange?: () => void;
  onCalendarEvent?: (name: CalendarEvent) => void;
}) {
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [plan, setPlan] = useState<Step[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [contextSent, setContextSent] = useState(false);
  const Heading = variant === "thanks" ? "h1" : "h2";
  const source = variant === "thanks" ? "thanks" : "watch";

  // Einmal beim Öffnen: was wissen wir schon, welche Fragen bleiben?
  useEffect(() => {
    const known = readProfile();
    const questions: Step[] = [];
    if (variant !== "thanks" && (!known.email || !known.role)) questions.push("contact");
    if (!known.size) questions.push("size");
    if (!known.revenue) questions.push("revenue");
    if (!known.pain) questions.push("pain");
    const final: Step = variant === "loom" ? "loom" : "audit";
    setProfile(known);
    setPlan([...questions, final]);
    setStep(questions[0] ?? final);
  }, [variant]);

  useEffect(() => {
    if (step) onStepChange?.();
  }, [step, onStepChange]);

  const update = (patch: VisitorProfile) => {
    const next = { ...(profile ?? {}), ...patch };
    setProfile(next);
    saveProfile(patch);
    return next;
  };

  /** Nächster Schritt im Plan; nach der letzten Frage im Audit-Modal direkt abschicken. */
  const advance = (from: Step, current: VisitorProfile) => {
    const next = plan[plan.indexOf(from) + 1];
    if (variant === "audit" && next === "audit") {
      void answerAudit(true, current);
      return;
    }
    setStep(next ?? "audit");
  };

  const back = (from: Step) => {
    const previous = plan[plan.indexOf(from) - 1];
    if (previous) setStep(previous);
  };

  const post = (body: Record<string, unknown>) =>
    submitOrSimulate("/api/training/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ training: slug, source, ...body }),
    }).then((response) => {
      if (!response.ok) throw new Error(String(response.status));
    });

  const answerAudit = async (wantsAudit: boolean, current: VisitorProfile, form?: HTMLFormElement) => {
    let p = current;
    if (!p.email && form) {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      p = update({ email: String(new FormData(form).get("email") ?? "") });
    }
    const showCalendar = wantsAudit && qualifiesForCalendar(p);
    setSending(true);
    setError(false);
    try {
      await post({
        kind: "survey",
        email: p.email,
        company_size: p.size ?? null,
        revenue: p.revenue ?? null,
        pain: p.pain ?? "",
        role: p.role ?? null,
        audit: wantsAudit ? "yes" : "no",
        calendar: wantsAudit ? (showCalendar ? "shown" : "not shown") : null,
      });
      setStep(wantsAudit ? (showCalendar ? "book" : "yes") : excludedFromVideo(p) ? "done" : "no");
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const sendContext = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const context = String(new FormData(event.currentTarget).get("context") ?? "").trim();
    if (!context || !profile) return;
    setSending(true);
    setError(false);
    try {
      await post({ kind: "audit-context", email: profile.email, context });
      setContextSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const counter = useMemo(() => {
    if (!step || plan.length < 2) return null;
    const index = plan.indexOf(step);
    return `${index === -1 ? plan.length : index + 1}/${plan.length}`;
  }, [plan, step]);

  if (!profile || !step) return null;

  const choices = (options: readonly string[], current: string | undefined, pick: (v: string) => void) => (
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

  const backLink = (from: Step) =>
    plan.indexOf(from) > 0 ? (
      <button type="button" className={styles.stepBack} onClick={() => back(from)}>
        Back
      </button>
    ) : null;

  const errorNote = error ? (
    <p className={formStyles.formError} role="alert">
      Something went wrong. Please try again, or just reply to the training email.
    </p>
  ) : null;

  const auditBullets = (
    <ul className={styles.bullets}>
      <li>Where your site loses buyers, and which people in the buying group it doesn&rsquo;t speak to</li>
      <li>What your competitors say that you don&rsquo;t, and where you all sound the same</li>
      <li>Clear next steps, lowest effort and highest impact first</li>
    </ul>
  );

  const answers = {
    role: profile.role,
    company_size: profile.size,
    revenue: profile.revenue,
    pain: profile.pain,
  };

  return (
    <>
      {counter && !["book", "yes", "no", "done"].includes(step) ? (
        <p className={styles.stepTag}>{counter}</p>
      ) : null}

      {step === "contact" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">
            {variant === "loom" ? "Happy to record you a video." : "Happy to do a free audit for you."}{" "}
            Just share a few details first.
          </Heading>
          <form
            className={formStyles.form}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              if (!form.checkValidity()) {
                form.reportValidity();
                return;
              }
              const data = new FormData(form);
              const email = String(data.get("email") ?? profile.email ?? "").trim();
              const role = String(data.get("role") ?? "");
              if (isFreeEmail(email)) {
                setEmailError(WORK_EMAIL_MESSAGE);
                return;
              }
              setEmailError(null);
              advance("contact", update({ email, role }));
            }}
          >
            <label className={formStyles.formField}>
              <span>Work email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={320}
                defaultValue={profile.email}
                aria-invalid={emailError ? true : undefined}
              />
              {emailError ? (
                <span className={formStyles.formError} role="alert">
                  {emailError}
                </span>
              ) : null}
            </label>
            <fieldset className={styles.roleChoices}>
              <legend>Where do you work?</legend>
              {TRAINING_ROLES.map((role) => (
                <label key={role.value} className={styles.roleChoice}>
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    required
                    defaultChecked={profile.role === role.value}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </fieldset>
            <div className={formStyles.formFooter}>
              <button className={formStyles.formSubmit} type="submit" disabled={sending}>
                {sending ? "Sending…" : "Next"}
              </button>
            </div>
            {errorNote}
          </form>
        </section>
      ) : null}

      {step === "size" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">
            {variant === "thanks" ? "One last step: how" : "How"} many people work at your company?
          </Heading>
          {choices(COMPANY_SIZES, profile.size, (size) => advance("size", update({ size })))}
          {sending ? <p className={styles.thanksNote}>One moment…</p> : null}
          {errorNote}
          {backLink("size")}
        </section>
      ) : null}

      {step === "revenue" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">Roughly what&rsquo;s your company&rsquo;s annual revenue?</Heading>
          {choices(REVENUE, profile.revenue, (revenue) => advance("revenue", update({ revenue })))}
          {sending ? <p className={styles.thanksNote}>One moment…</p> : null}
          {errorNote}
          {backLink("revenue")}
        </section>
      ) : null}

      {step === "pain" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">
            {variant === "thanks" ? "What made you sign up? " : ""}What&rsquo;s bugging you about your
            website right now?
          </Heading>
          <p>Feel free to vent. The more honest, the better we can help.</p>
          <form
            className={formStyles.form}
            onSubmit={(event) => {
              event.preventDefault();
              const pain = String(new FormData(event.currentTarget).get("pain") ?? "").trim();
              if (pain.length < 3) return;
              advance("pain", update({ pain }));
            }}
          >
            <label className={formStyles.formField}>
              <span className={styles.visuallyHidden}>Your answer</span>
              <textarea
                name="pain"
                required
                minLength={3}
                rows={5}
                maxLength={3000}
                defaultValue={profile.pain}
                placeholder="e.g. We get traffic, but hardly any demo requests, and nobody agrees on why…"
              />
            </label>
            <div className={formStyles.formFooter}>
              <button className={formStyles.formSubmit} type="submit" disabled={sending}>
                {sending ? "Sending…" : "Next"}
              </button>
            </div>
            {errorNote}
          </form>
          {backLink("pain")}
        </section>
      ) : null}

      {step === "audit" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">
            {variant === "thanks"
              ? "Based on your answers, we can do a free audit of your website."
              : "Your free website audit"}
          </Heading>
          <p>A plan for your site, walked through with you on a short call:</p>
          {auditBullets}
          {variant === "thanks" ? <p>Want it?</p> : null}
          <form
            className={formStyles.form}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void answerAudit(true, profile, event.currentTarget);
            }}
          >
            {profile.email ? null : (
              <label className={formStyles.formField}>
                <span>Work email you signed up with</span>
                <input name="email" type="email" autoComplete="email" required maxLength={320} />
              </label>
            )}
            <div className={styles.auditActions}>
              <button className={formStyles.formSubmit} type="submit" disabled={sending}>
                {sending ? "Sending…" : "Yes, I want my free audit"}
              </button>
              {variant === "thanks" ? (
                <button
                  type="button"
                  className={styles.calendarSkip}
                  disabled={sending}
                  onClick={(event) => {
                    void answerAudit(false, profile, event.currentTarget.form ?? undefined);
                  }}
                >
                  No thanks
                </button>
              ) : null}
            </div>
            {errorNote}
          </form>
          {backLink("audit")}
        </section>
      ) : null}

      {step === "loom" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">Send us one page, we send you a video</Heading>
          <p>
            We record a short video breakdown of the potential we see, based on your page, your
            competitors, your market and what customers say publicly. You get it by email.
          </p>
          <TrainingLoomForm
            slug={slug}
            source={source}
            email={profile.email}
            answers={answers}
            onSent={() => setStep("upsell")}
          />
          {backLink("loom")}
        </section>
      ) : null}

      {step === "upsell" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <p className={styles.thanksNote}>
            Got it, thank you. We&rsquo;ll send you the video by email, usually within a few working
            days.
          </p>
          <Heading id="step-title">Want a free in-depth audit too?</Heading>
          <p>Goes further than the video: a plan for your site, walked through with you on a short call:</p>
          {auditBullets}
          <div className={styles.auditActions}>
            <button
              type="button"
              className={formStyles.formSubmit}
              disabled={sending}
              onClick={() => void answerAudit(true, profile)}
            >
              {sending ? "Sending…" : "Yes, I want my free audit"}
            </button>
            <button
              type="button"
              className={styles.calendarSkip}
              disabled={sending}
              onClick={() => setStep("done")}
            >
              No thanks
            </button>
          </div>
          {errorNote}
        </section>
      ) : null}

      {step === "book" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">Great. Pick a time that works for you.</Heading>
          <p>
            The audit starts with a call to discuss your situation. From there, I&rsquo;ll dig into
            your site on my own and put together the audit with clear recommendations on what to
            improve.
          </p>
          <AuditCalendar prefill={calendarPrefill(profile)} onEvent={onCalendarEvent} />
          <p className={styles.thanksNote}>
            None of the times work? Just reply to the training email and we&rsquo;ll find one.
            Calendar by Cal.com, see our <a href="/privacy">privacy policy</a>.
          </p>
          <p className={styles.thanksNote}>— Simon</p>
        </section>
      ) : null}

      {step === "yes" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">Great. I&rsquo;ll get back to you by email.</Heading>
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
                {errorNote}
              </div>
            </form>
          )}
          <p className={styles.thanksNote}>— Simon</p>
        </section>
      ) : null}

      {step === "no" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">No problem. Want a short video breakdown instead? No call needed.</Heading>
          <div
            className={styles.loomCard}
            role="region"
            aria-labelledby="loom-title"
            data-theme="light-primary"
          >
            <h2 id="loom-title">Send us one page, we send you a video</h2>
            <p>
              We record a short video breakdown of the potential we see, based on your page, your
              competitors, your market and what customers say publicly. You get it by email.
            </p>
            <TrainingLoomForm slug={slug} source={source} email={profile.email} answers={answers} />
          </div>
        </section>
      ) : null}

      {step === "done" ? (
        <section className={styles.signupStep} aria-labelledby="step-title">
          <Heading id="step-title">
            {variant === "thanks" ? "No problem. Enjoy the training." : "All set. Talk soon."}
          </Heading>
          <p className={styles.thanksNote}>— Simon</p>
        </section>
      ) : null}
    </>
  );
}
