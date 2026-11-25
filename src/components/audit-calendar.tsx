"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { submitOrSimulate } from "@/lib/form-simulation";
import formStyles from "./book-call.module.css";
import styles from "@/app/training/training.module.css";

/**
 * Eigener Buchungskalender fürs Gratis-Audit (Simon 23.11.), Schritt "book" in
 * TrainingSignupSteps. Ersetzt das Cal.com-Embed, damit Layout und Stil
 * unsere sind (Kopf mit Avatar, 2x2-Infos, Schatten, keine Leerflächen).
 *
 * Daten: /api/audit/slots (freie Zeiten) und /api/audit/book (Buchung), beide
 * reichen serverseitig an Cal.com durch (lib/cal-audit.ts). Zeiten, Dauer,
 * Mindestvorlauf und Google Meet pflegt Simon in Cal.com.
 *
 * Ablauf: Tag wählen -> Uhrzeit wählen -> Name/Mail/Notizen (vorausgefüllt)
 * -> "Confirm booking" -> Bestätigung. Mit ?simulate=1 (nur Dev) wird nicht
 * wirklich gebucht.
 */

type Prefill = { name?: string; email?: string; notes?: string };
type Slots = Record<string, string[]>;
type View = "pick" | "details" | "booked";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatTime = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(
    new Date(iso),
  );
const formatDay = (key: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(
    fromKey(key),
  );
const formatMonth = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);

/** Wochen des Monats, Montag zuerst; null = Leerfeld. */
function monthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** Für die Zuschau-Messung (Simon 25.11.): Uhrzeit gewählt / gebucht */
export type CalendarEvent = "time-picked" | "booked";

export function AuditCalendar({
  prefill,
  onEvent,
}: {
  prefill: Prefill;
  onEvent?: (name: CalendarEvent) => void;
}) {
  const [timeZone, setTimeZone] = useState<string | null>(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [slots, setSlots] = useState<Slots | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [view, setView] = useState<View>("pick");
  const [sending, setSending] = useState(false);
  const [bookError, setBookError] = useState<"taken" | "email" | "error" | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  const thisMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  useEffect(() => {
    if (!timeZone) return;
    let cancelled = false;
    setSlots(null);
    setLoadError(false);
    const today = new Date();
    const start = month.getTime() === thisMonth.getTime() ? today : month;
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const params = new URLSearchParams({ start: dayKey(start), end: dayKey(end), timeZone });
    fetch(`/api/audit/slots?${params}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((json: { slots: Slots }) => {
        if (cancelled) return;
        setSlots(json.slots);
        // Ersten freien Tag vorauswählen, damit gleich Zeiten zu sehen sind
        setDay((current) =>
          current && json.slots[current]?.length ? current : (Object.keys(json.slots).sort()[0] ?? null),
        );
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [month, timeZone, thisMonth]);

  const book = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!slot) return;
    const data = new FormData(form);
    setSending(true);
    setBookError(null);
    try {
      const response = await submitOrSimulate("/api/audit/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: slot,
          name: data.get("name"),
          email: data.get("email"),
          notes: data.get("notes"),
          timeZone: tz,
        }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        meetingUrl?: string | null;
      };
      if (!response.ok) {
        setBookError(json.error === "taken" ? "taken" : json.error === "email" ? "email" : "error");
        if (json.error === "taken") {
          setSlot(null);
          setView("pick");
          setMonth((m) => new Date(m)); // Zeiten neu laden
        }
        return;
      }
      setMeetingUrl(json.meetingUrl ?? null);
      setView("booked");
      onEvent?.("booked");
    } catch {
      setBookError("error");
    } finally {
      setSending(false);
    }
  };

  const tz = timeZone ?? "UTC";
  const daySlots = day && slots ? (slots[day] ?? []) : [];
  const canGoBack = month > thisMonth;

  return (
    <div className={styles.calCard}>
      <header className={styles.calHeader}>
        <div className={styles.calHost}>
          <Image src="/assets/simon-ziri.jpg" alt="" width={40} height={40} sizes="40px" />
          <span>Simon Ziri</span>
        </div>
        <h2>Free website audit</h2>
        <dl className={styles.calMeta}>
          <div>
            <dt>Date</dt>
            <dd>{day ? formatDay(day) : "Pick a day"}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{slot ? formatTime(slot, tz) : "Pick a time"} · 30 min</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>Google Meet</dd>
          </div>
          <div>
            <dt>Time zone</dt>
            <dd>{tz.replace(/_/g, " ")}</dd>
          </div>
        </dl>
      </header>

      {view === "pick" ? (
        <div className={styles.calBody}>
          <div className={styles.calMonth}>
            <div className={styles.calMonthNav}>
              <span>{formatMonth(month)}</span>
              <div>
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={!canGoBack}
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                >
                  ›
                </button>
              </div>
            </div>
            <div className={styles.calGrid} role="grid" aria-busy={slots === null}>
              {WEEKDAYS.map((name) => (
                <span key={name} className={styles.calWeekday}>
                  {name}
                </span>
              ))}
              {monthGrid(month).map((date, index) => {
                if (!date) return <span key={`e${index}`} />;
                const key = dayKey(date);
                const open = Boolean(slots?.[key]?.length);
                return (
                  <button
                    type="button"
                    key={key}
                    className={styles.calDay}
                    disabled={!open}
                    aria-pressed={day === key}
                    onClick={() => {
                      setDay(key);
                      setSlot(null);
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.calTimes}>
            {loadError ? (
              <p className={styles.calHint}>
                Couldn&rsquo;t load the times. Please refresh, or just reply to the training email.
              </p>
            ) : slots === null ? (
              <p className={styles.calHint}>Loading times…</p>
            ) : !day ? (
              <p className={styles.calHint}>No free times this month. Try the next one.</p>
            ) : (
              <>
                <p className={styles.calTimesTitle}>{formatDay(day)}</p>
                <div className={styles.calSlotList}>
                  {daySlots.map((start) => (
                    <button
                      type="button"
                      key={start}
                      className={styles.calSlot}
                      onClick={() => {
                        setSlot(start);
                        setBookError(null);
                        setView("details");
                        onEvent?.("time-picked");
                      }}
                    >
                      {formatTime(start, tz)}
                    </button>
                  ))}
                </div>
              </>
            )}
            {bookError === "taken" ? (
              <p className={formStyles.formError} role="alert">
                Someone just took that time. Please pick another one.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {view === "details" ? (
        <form className={`${formStyles.form} ${styles.calForm}`} onSubmit={book} noValidate>
          <label className={formStyles.formField}>
            <span>Your name</span>
            <input name="name" defaultValue={prefill.name} autoComplete="name" required maxLength={200} />
          </label>
          <label className={formStyles.formField}>
            <span>Email</span>
            <input
              name="email"
              type="email"
              defaultValue={prefill.email}
              autoComplete="email"
              required
              maxLength={320}
            />
          </label>
          <label className={formStyles.formField}>
            <span>Anything I should know before the call?</span>
            <textarea name="notes" rows={5} maxLength={2000} defaultValue={prefill.notes} />
          </label>
          <div className={styles.calFormActions}>
            <button className={formStyles.formSubmit} type="submit" disabled={sending}>
              {sending ? "Booking…" : "Confirm booking"}
            </button>
            <button
              type="button"
              className={styles.calendarSkip}
              disabled={sending}
              onClick={() => {
                setView("pick");
                setSlot(null);
              }}
            >
              Pick another time
            </button>
          </div>
          {bookError === "email" ? (
            <p className={formStyles.formError} role="alert">
              That email address can&rsquo;t receive mail, so the invite wouldn&rsquo;t
              reach you. Please check it.
            </p>
          ) : null}
          {bookError === "error" ? (
            <p className={formStyles.formError} role="alert">
              Something went wrong booking the call. Please try again, or just reply
              to the training email.
            </p>
          ) : null}
        </form>
      ) : null}

      {view === "booked" && slot && day ? (
        <div className={styles.calDone} role="status">
          <h3>You&rsquo;re booked.</h3>
          <p>
            {formatDay(day)}, {formatTime(slot, tz)} ({tz.replace(/_/g, " ")}). The
            calendar invite with the Google Meet link is on its way to your inbox.
          </p>
          {meetingUrl ? (
            <p>
              <a href={meetingUrl} target="_blank" rel="noreferrer">
                Google Meet link
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
