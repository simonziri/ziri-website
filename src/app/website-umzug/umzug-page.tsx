"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PixelHatchButton } from "@/components/pixel-hatch-button";
import { SectionTag } from "@/components/section-tag";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import footer from "@/components/site-footer.module.css";
import { WebsiteUmzugFaq } from "@/components/website-umzug-faq";
import training from "../training/training.module.css";
import base from "./website-umzug.module.css";
import s from "./umzug.module.css";

/* ------------------------------------------------------------------ */
/* Inhalte (deutsch, du). Copy-Regeln: keine Em-Dashes, keine AI-Floskeln. */
/* ------------------------------------------------------------------ */

/** Grüner Kreis mit weißem Haken */
function CheckDot() {
  return (
    <span className={s.checkDot} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="10" height="10">
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}


const CTA = "Prüfen, ob du die Garantie bekommst";

/** Pixel-Buttons haben feste Höhe ohne Umbruch: mobil die Kurzform */
const ctaLabel = (
  <>
    <span className={s.ctaLong}>{CTA}</span>
    <span className={s.ctaShort}>Garantie prüfen</span>
  </>
);

const BIO =
  "Seit 7 Jahren baut Simon mit ZIRI Websites für B2B-Unternehmen, oft mit Deadlines, die als unmöglich galten. Zuletzt hat ZIRI über 1.000 Seiten für ein Software-Unternehmen in unter 6 Wochen relauncht und über 200 Seiten für ein Fintech.";

const testimonialsDe = [
  {
    quote:
      "„DANKE. Ich würde für immer mit euch an Webprojekten arbeiten, weil Feedback und Umsetzung so reibungslos und präzise laufen. Ein echter Glücksgriff.“",
    role: "Co-Founder, Biotech-Startup",
  },
  {
    quote:
      "„Sie haben sich in kürzester Zeit in unser Problem und unsere Lösung eingearbeitet und ein Design gebaut, das unsere Geschichte klar erzählt.“",
    role: "CEO & Founder, B2B-Software",
  },
  {
    quote:
      "„Wollte nur kurz sagen: ZIRI ist großartig. Absolut herausragende Arbeit. Danke für die Empfehlung!“",
    role: "VP of Marketing, B2B-SaaS",
  },
  {
    quote: "„Wir sind super happy mit dem Ergebnis. Danke für eure Arbeit.“",
    role: "CEO, HR-Tech",
  },
  {
    quote:
      "„Danke euch, ZIRI. Wirklich happy mit den Ergebnissen und der Zusammenarbeit.“",
    role: "Founder, Software-Startup",
  },
];


const dream = [
  {
    title: "Neue Seiten mit KI",
    text: "Du beschreibst, was du brauchst. Die KI baut die Seite aus euren fertigen Bausteinen, im Design, das schon passt.",
  },
  {
    title: "Backups ohne Nachdenken",
    text: "Jede Änderung wird versioniert. Ein Fehler ist mit einem Klick rückgängig gemacht.",
  },
  {
    title: "Keine Plugins, keine Updates",
    text: "Es gibt nichts mehr, was nachts ein Update braucht. Kein PHP, keine Plugin-Sammlung, kein Notfall.",
  },
  {
    title: "Schneller als vorher",
    text: "Ohne den Ballast des alten Systems lädt die Seite in der Regel spürbar schneller.",
  },
];

const steps = [
  {
    title: "Check",
    text: "Du schickst uns deine URL. Simon sieht sich jede Seite selbst an. Du bekommst einen Festpreis oder ein klares Nein, und weißt danach auf jeden Fall, wo deine Seite steht.",
  },
  {
    title: "Umzug",
    text: "Wir bauen deine Seite 1:1 auf einem modernen System nach und prüfen jede Unterseite, jedes Formular und jeden Link. Die alte Seite läuft so lange weiter.",
  },
  {
    title: "Freigabe",
    text: "Du schaust dir alles in Ruhe an. Erst nach deinem OK stellen wir die Domain um. Danach zeigen wir deinem Team den Editor.",
  },
];

const rows = [
  {
    today: "PHP-Warnungen vom Hoster",
    todayText: "Updaten kann Plugins zerlegen, nicht updaten ist ein Risiko.",
    after: "Kein PHP mehr",
    afterText: "Die Seite wird vorab gebaut. Es gibt keine PHP-Version, die ausläuft.",
  },
  {
    today: "Updates machen Dinge kaputt",
    todayText: "Ein Plugin-Update, und das Formular schickt nichts mehr.",
    after: "Nichts zu aktualisieren",
    afterText: "Keine Plugins, kein Theme, keine Update-Liste im Backend.",
  },
  {
    today: "Jede neue Seite ist ein Projekt",
    todayText: "Ticket, Entwickler, Abstimmung. Eine Woche für eine Landingpage.",
    after: "Neue Seiten selbst bauen",
    afterText: "Aus euren Bausteinen im Editor, auf Wunsch per Beschreibung mit KI.",
  },
  {
    today: "Ein Fehler, und es ist weg",
    todayText: "Backups liegen irgendwo beim Hoster, wenn überhaupt.",
    after: "Jede Änderung versioniert",
    afterText: "Ein Klick, und die vorherige Version ist zurück.",
  },
];


const faq = [
  {
    q: "Verliere ich meine Google-Rankings?",
    a: "Alle URLs bleiben gleich. Wo sich etwas ändert, setzen wir Weiterleitungen. Nach dem Go-live prüfen wir die Seite in der Search Console.",
  },
  {
    q: "Auf welches System zieht meine Seite um?",
    a: "Auf ein modernes Headless-System: einen Editor, in dem dein Team Texte, Bilder und Seiten pflegt, und daraus gebaut eine schnelle Website ohne PHP und ohne Plugins. Welche Tools wir genau einsetzen, erklären wir dir im Erstgespräch.",
  },
  {
    q: "Kann mein Team danach noch selbst Texte ändern?",
    a: "Ja, im Editor, ohne Entwickler. Neue Seiten baut ihr aus euren Bausteinen, auf Wunsch mit KI.",
  },
  {
    q: "Was kostet der Betrieb danach?",
    a: "Für Seiten dieser Größe sind die laufenden Kosten für Editor und Hosting in der Regel gering. Wir sagen dir vorher genau, womit du rechnen musst.",
  },
  {
    q: "Meine Seite hat Formulare und Embeds. Geht das?",
    a: "Ja. Formulare, Videos, Kalender und Karten ziehen mit um. Komplexe Automationen schauen wir uns vorher genau an und sagen dir ehrlich, ob sie in den Festpreis passen.",
  },
  {
    q: "Was, wenn meine Seite größer ist?",
    a: "Schick uns trotzdem die URL. Du bekommst einen ehrlichen Festpreis oder ein klares Nein.",
  },
];

/* ------------------------------------------------------------------ */
/* Bausteine                                                           */
/* ------------------------------------------------------------------ */

type PageCount = "bis-15" | "ueber-15" | "unklar";

const pageOptions: { value: PageCount; label: string }[] = [
  { value: "bis-15", label: "Bis 15 Seiten" },
  { value: "ueber-15", label: "Über 15 Seiten" },
  { value: "unklar", label: "Weiß ich nicht" },
];

/* Gleiche Prüfung wie in der API-Route: Domain mit Punkt, optional Protokoll/Pfad */
const URL_PATTERN = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

const START_OPTIONS = ["Diese Woche", "Nächste Woche", "Später"] as const;

/**
 * 3-Schritt-Formular → POST /api/website-umzug (speichert nichts, Resend +
 * Pipedrive). Erfolgreiche Submits feuern "ziri:website-umzug:submitted";
 * Tracking hängt zentral in consent-banner.tsx. Privacy: Abschnitt 4a.
 */
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [pages, setPages] = useState<PageCount | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  if (status === "sent") {
    return (
      <div className={s.msDone} role="status">
        <strong>Danke! Deine Anfrage ist da.</strong>
        <p>
          Simon sieht sich deine Seite an und meldet sich persönlich, meist am
          selben Tag.
        </p>
      </div>
    );
  }

  const budgetText =
    pages === "bis-15"
      ? "Ich bin bereit, 2.900 € (netto) in den Umzug zu investieren."
      : "Mir ist klar: Größere Seiten bekommen ein eigenes Angebot, ab 2.900 € (netto).";

  const submit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    setStatus("sending");
    try {
      const response = await fetch("/api/website-umzug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages,
          url: data.get("url"),
          email: data.get("email"),
          phone: data.get("phone"),
          start: data.get("start"),
          budget: data.get("budget") === "on",
          consent: data.get("consent") === "on",
          company_website_2: data.get("company_website_2"),
          utm_source: params.get("utm_source"),
          utm_campaign: params.get("utm_campaign"),
          utm_content: params.get("utm_content"),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      window.dispatchEvent(new CustomEvent("ziri:website-umzug:submitted"));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      ref={formRef}
      className={s.ms}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (step === 2) {
          const url = form.elements.namedItem("url") as HTMLInputElement;
          url.setCustomValidity(
            url.value && !URL_PATTERN.test(url.value.trim())
              ? "Bitte gib eine Web-Adresse ein, z. B. deinefirma.de"
              : "",
          );
        }
        // Nur die Felder des aktuellen Schritts prüfen
        const fields = form.querySelectorAll<HTMLInputElement>(
          `[data-step="${step}"] input[required]`,
        );
        for (const field of fields) {
          if (!field.checkValidity()) {
            field.reportValidity();
            return;
          }
        }
        if (step < 3) setStep(step + 1);
        else void submit(form);
      }}
    >
      {/* Honeypot, für Menschen unsichtbar */}
      <label className={s.honeypot} aria-hidden="true">
        Bitte leer lassen
        <input name="company_website_2" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className={s.msProgress} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= step ? s.msDot : s.msDotIdle} />
        ))}
      </div>
      <p className={s.msStep}>Schritt {step} von 3</p>

      {/* Alle Schritte bleiben im DOM (Werte gehen nicht verloren), nur der aktive ist sichtbar */}
      <fieldset className={s.msFieldset} data-step="1" hidden={step !== 1}>
        <legend className={s.msQuestion}>Wie viele Seiten hat deine Website?</legend>
        <div className={s.msOptions}>
          {pageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={pages === option.value ? s.msOptionActive : s.msOption}
              onClick={() => {
                setPages(option.value);
                setStep(2);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.msFieldset} data-step="2" hidden={step !== 2}>
        <legend className={s.msQuestion}>Wohin dürfen wir dein Ergebnis schicken?</legend>
        <label className={s.msField}>
          <span>Website-URL</span>
          <input
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="deinefirma.de"
            maxLength={320}
            required
            onChange={(event) => event.currentTarget.setCustomValidity("")}
          />
        </label>
        <label className={s.msField}>
          <span>Geschäftliche E-Mail</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@deinefirma.de"
            maxLength={320}
            required
          />
        </label>
        <label className={s.msField}>
          <span>Telefon</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+49 …"
            maxLength={40}
            required
          />
        </label>
        <div className={s.msNav}>
          <button type="button" className={s.msBack} aria-label="Zurück" onClick={() => setStep(1)}>
            ←
          </button>
          <button type="submit" className={s.msNext}>
            Weiter
          </button>
        </div>
      </fieldset>

      <fieldset className={s.msFieldset} data-step="3" hidden={step !== 3}>
        <legend className={s.msQuestion}>Wann willst du starten?</legend>
        <div className={s.msOptions}>
          {START_OPTIONS.map((label, index) => (
            <label key={label} className={s.msRadio}>
              <input type="radio" name="start" value={label} defaultChecked={index === 0} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <label className={s.msCheck}>
          <input name="budget" type="checkbox" required />
          <span>{budgetText}</span>
        </label>
        <label className={s.msCheck}>
          <input name="consent" type="checkbox" required />
          <span>
            Ich bin einverstanden, dass ZIRI meine Angaben nutzt, um mich zum
            Umzug zu kontaktieren. Details in der{" "}
            <a href="/privacy#website-umzug">Datenschutzerklärung</a>.
          </span>
        </label>
        <div className={s.msNav}>
          <button type="button" className={s.msBack} aria-label="Zurück" onClick={() => setStep(2)}>
            ←
          </button>
          <button type="submit" className={s.msSubmit} disabled={status === "sending"}>
            {status === "sending" ? "Wird gesendet…" : CTA}
          </button>
        </div>
        {status === "error" ? (
          <p className={s.msError} role="alert">
            Das hat nicht geklappt. Bitte versuch es noch einmal oder schreib an
            hello@simonziri.com.
          </p>
        ) : null}
      </fieldset>
    </form>
  );
}

function Band({
  theme,
  children,
  className = "",
}: {
  theme?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${base.band} ${className}`} data-theme={theme ?? "light-primary"}>
      <div className={base.inner}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sektionen mit Varianten                                             */
/* ------------------------------------------------------------------ */


const navItems = [
  { id: "steps", label: "Ablauf" },
  { id: "price", label: "Preis" },
  { id: "guarantee", label: "Garantie" },
  { id: "quotes", label: "Kunden" },
  { id: "about", label: "Über ZIRI" },
  { id: "faq", label: "FAQ" },
];

function ZiriLogo() {
  return (
    <svg width="77" height="31" viewBox="0 0 77 31" fill="none" role="img" aria-label="ZIRI">
      <path d="M77 30.0674H65.9375V0H77V30.0674Z" fill="currentColor" />
      <path
        d="M53.1914 1.98535H53.4756C53.9294 1.49379 54.6101 1.03997 55.5176 0.624023C56.4253 0.207999 57.4464 5.71137e-06 58.5811 0H63.6865V10.2119H58.5811C56.9926 10.2119 55.7822 10.6467 54.9502 11.5166C54.156 12.3486 53.7588 13.6156 53.7588 15.3174V30.0674H42.6963V0H52.624L53.1914 1.98535Z"
        fill="currentColor"
      />
      <path d="M40.2583 30.0674H29.1958V0H40.2583V30.0674Z" fill="currentColor" />
      <path
        d="M26.3799 9.36035L14.75 20.4229H26.6641V30.0674H0V20.707L11.6299 9.64453H0.283203V0H26.3799V9.36035Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UmzugHeader({ items, active }: { items: typeof navItems; active: string | null }) {
  return (
    <header className={s.navHeader} data-theme="light-primary">
      {/* Bewusst kein Link zur Startseite: das restliche ZIRI-Angebot ist ein anderes */}
      <a href="#hero" aria-label="Zum Seitenanfang" className={s.navLogo}>
        <ZiriLogo />
      </a>
      <nav className={s.navDesktop} aria-label="Seitennavigation">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "true" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <a className={s.navCta} href="#check">
        Loslegen
      </a>
    </header>
  );
}

function BottomNav({ items, active }: { items: typeof navItems; active: string | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Beim Seiten-Scroll den aktiven Punkt in die Leiste holen; Daumen-Scroll
  // bleibt frei, die Leiste richtet sich beim nächsten Abschnittswechsel neu aus.
  useEffect(() => {
    const box = scrollRef.current;
    if (!box || !active) return;
    const chip = box.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    if (!chip) return;
    box.scrollTo({ left: Math.max(0, chip.offsetLeft - 8), behavior: "smooth" });
  }, [active]);

  return (
    <nav className={s.bottomNav} aria-label="Seitennavigation mobil">
      <div className={s.bottomNavScroll} ref={scrollRef}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-nav={item.id}
            aria-current={active === item.id ? "true" : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
      <a className={s.bottomNavCta} href="#check">
        Loslegen
      </a>
    </nav>
  );
}

/** Footer wie auf simonziri.com, plus CTA zurück zum Formular */
function UmzugFooter({ items }: { items: typeof navItems }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const b = el.getBoundingClientRect();
      if (b.bottom < 0 || b.top > window.innerHeight) return;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - b.top) / (window.innerHeight + b.height)));
      el.style.setProperty("--footer-parallax-y", `${(1 - progress) * 260}px`);
      el.style.setProperty("--footer-artwork-opacity", `${Math.min(1, progress * 1.6).toFixed(3)}`);
    };
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <footer className={footer.footer} ref={ref}>
      <div className={footer.head}>
        <h2>
          <span>Raus aus PHP,</span> <span>zum Festpreis?</span>
        </h2>
        <nav className={footer.navigation} aria-label="Footer-Navigation">
          <PixelHatchButton
            className={`${s.fullCta} ${footer.footerButton} ${footer.footerButtonActive}`}
            href="#check"
            variant="secondary"
          >
            {ctaLabel}
          </PixelHatchButton>
          {items.slice(0, 3).map((item) => (
            <PixelHatchButton className={footer.footerButton} href={`#${item.id}`} key={item.id}>
              {item.label}
            </PixelHatchButton>
          ))}
        </nav>
        <div className={footer.legal}>
          <Link href="/privacy">Datenschutz</Link>
          <Link href="/imprint">Impressum</Link>
          <CookieSettingsButton label="Cookie-Einstellungen" />
        </div>
      </div>
      <div className={footer.footerArtwork}>
        <Image
          className={footer.footerImage}
          src="/assets/footer-image.avif"
          alt="ZIRI Pixel-Wortmarke"
          fill
          sizes="100vw"
        />
      </div>
    </footer>
  );
}


/* ------------------------------------------------------------------ */
/* Seite                                                               */
/* ------------------------------------------------------------------ */

export function UmzugPage() {
  const [active, setActive] = useState<string | null>(null);

  // Scroll-Spy für die Navigation: letzter Abschnitt, dessen Oberkante die
  // Bildschirmmitte passiert hat (Reihenfolge der navItems = DOM-Reihenfolge)
  useEffect(() => {
    const targets = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const onScroll = () => {
      const line = window.innerHeight * 0.45;
      let current: string | null = null;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${training.page} ${s.labPage}`}>
      <UmzugHeader items={navItems} active={active} />
      <main className={base.main} lang="de">
      <div id="hero" className={s.sectionWrap}>
          <div className={s.heroCenter}>
            <SectionTag>PHP-Warnung von deinem Hoster?</SectionTag>
            <h1>Website-Umzug in 72 Stunden. Garantiert.</h1>
            <p className={base.subline}>
              Wir ziehen deine Marketing-Seite von deinem alten CMS auf ein
              modernes System um. Gleiches Design, gleiche Links,
              Festpreis.
            </p>
            <div className={s.heroFormCard} id="check" data-theme="light-primary">
              <MultiStepForm />
            </div>
            <p className={`${s.heroNote} ${s.noteWithDot}`}>
              <CheckDot />
              Kostenlos und unverbindlich. Wir melden uns persönlich, meist am
              selben Tag.
            </p>
          </div>
      </div>
      <div id="proof" className={s.sectionWrap}>
          <div className={s.proofBio}>
            <div className={s.proofBioText}>
              <Image
                className={s.avatarRound}
                src="/assets/simon-ziri.jpg"
                alt="Simon Ziri"
                width={56}
                height={56}
              />
              <p>{BIO}</p>
            </div>
          </div>
      </div>
      <div id="pain" className={s.sectionWrap}>
          <Band>
            <div className={s.centerHead}>
              <h2>Deine Website heute. Und nach dem Umzug.</h2>
            </div>
            <div className={s.table} role="table">
              <div className={s.tableHead} role="row">
                <span role="columnheader">Heute</span>
                <span className={s.tableArrow} aria-hidden="true">→</span>
                <span role="columnheader">Nach dem Umzug</span>
              </div>
              {rows.map((row) => (
                <div className={s.tableRow} role="row" key={row.today}>
                  <div role="cell">
                    <strong>{row.today}</strong>
                    <p>{row.todayText}</p>
                  </div>
                  <div role="cell" className={s.tableAfter}>
                    <strong>{row.after}</strong>
                    <p>{row.afterText}</p>
                  </div>
                </div>
              ))}
            </div>
          </Band>
      </div>
      <div id="dream" className={s.sectionWrap}>
          <Band>
            <h2>So fühlt sich deine Website danach an.</h2>
            <div className={s.cards4}>
              {dream.map((item) => (
                <article key={item.title} className={s.cardPlain}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </Band>
      </div>
      <div id="steps" className={s.sectionWrap}>
          <section className={`${base.band} ${base.steps}`} data-theme="dark-primary">
            <div className={base.inner}>
              <h2>So läuft&rsquo;s</h2>
              <p className={s.lead}>
                Kein Redesign-Projekt mit wochenlanger Laufzeit. Gleiches Design,
                72 Stunden, Festpreis.
              </p>
              <ol className={base.stepList}>
                {steps.map((step, index) => (
                  <li key={step.title}>
                    <span className={base.stepNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
      </div>
      <div id="price" className={s.sectionWrap}>
          <Band>
            <div className={s.pricingHead}>
              <p className={training.monoLabel}>Preis</p>
              <h2>Ein Festpreis für kleine Seiten. Ein ehrliches Angebot für alles darüber.</h2>
            </div>
            <div className={s.plans}>
              <article className={s.planFeatured} data-theme="dark-primary">
                <p className={s.planTag}>Festpreis</p>
                <h3>Bis 15 Seiten</h3>
                <p className={s.planPrice}>
                  2.900&nbsp;€ <span>netto, einmalig</span>
                </p>
                <p className={s.planText}>
                  Für Marketing-Seiten mit Formularen, Embeds und Tracking. Mit
                  Termin-Garantie, wenn deine Seite unseren Check besteht.
                </p>
                <PixelHatchButton className={s.fullCta} href="#check" variant="secondary">
                  {ctaLabel}
                </PixelHatchButton>
              </article>
              <article className={s.planPlain}>
                <p className={s.planTagPlain}>Individuell</p>
                <h3>Über 15 Seiten, Shops und mehr</h3>
                <p className={s.planPriceSmall}>Eigenes Angebot</p>
                <p className={s.planText}>
                  Größere Seiten, Shops, Logins oder komplexe Automationen. Du
                  bekommst nach dem Check einen Festpreis oder ein klares Nein.
                </p>
                <a className={s.planLink} href="#check">
                  Angebot anfragen →
                </a>
              </article>
            </div>
            <div className={s.included}>
              <p className={training.monoLabel}>Immer enthalten</p>
              <ul className={s.includedList}>
                <li>Gleiches Design, gleiche Texte</li>
                <li>Gleiche URLs und Weiterleitungen</li>
                <li>Formulare und Embeds übernommen</li>
                <li>Tracking und Cookie-Banner übernommen</li>
                <li>Editor inkl. Einweisung</li>
                <li>Kein PHP, keine Plugins</li>
              </ul>
            </div>
          </Band>
      </div>
      <div id="guarantee" className={s.sectionWrap}>
          <Band theme="light-secondary">
            <p className={training.monoLabel}>Garantie</p>
            <h2>Zwei Garantien, wenn deine Seite passt.</h2>
            <div className={base.guaranteeGrid}>
              <article className={`${base.guaranteeCard} ${s.card}`}>
                <h3>72 Stunden oder Geld zurück.</h3>
                <p>
                  Ist deine neue Seite 72 Stunden nach Projektstart nicht bereit
                  zur Freigabe, entscheidest du: Geld zurück, oder wir machen
                  weiter.
                </p>
              </article>
              <article className={`${base.guaranteeCard} ${s.card}`}>
                <h3>30 Tage Nachbesserung.</h3>
                <p>
                  Findest du nach dem Go-live einen kaputten Link oder ein
                  Formular, das nicht ankommt, beheben wir es kostenlos.
                </p>
              </article>
            </div>
            <p className={base.guaranteeNote}>
              Die Garantie gilt für Seiten, die wir vorher geprüft haben. Ob deine
              dazugehört, sagen wir dir nach dem Check.
            </p>
            <div>
              <PixelHatchButton className={s.fullCta} href="#check">{ctaLabel}</PixelHatchButton>
            </div>
          </Band>
      </div>
      <div id="quotes" className={s.sectionWrap}>
          <Band theme="light-secondary">
            <div className={s.pricingHead}>
              <p className={training.monoLabel}>Stimmen unserer Kunden</p>
              <h2>Was Teams über die Zusammenarbeit sagen.</h2>
            </div>
            <div className={s.testimonialGrid}>
              {testimonialsDe.map((t) => (
                <figure key={t.quote} className={s.testimonial}>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <span>
                      <strong>{t.role}</strong>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className={s.translateNote}>Zitate aus dem Englischen übersetzt.</p>
          </Band>
      </div>
      <div id="about" className={s.sectionWrap}>
          <Band>
            <div className={s.about}>
              <Image
                className={s.aboutPhoto}
                src="/assets/simon-ziri.jpg"
                alt="Simon Ziri"
                width={200}
                height={200}
              />
              <div className={s.aboutText}>
                <h2>Über ZIRI</h2>
                <p className={s.lead}>{BIO}</p>
              </div>
            </div>
          </Band>
      </div>
      <div id="faq" className={s.sectionWrap}>
          <section className={`${base.band} ${base.faq}`} data-theme="dark-primary">
            <div className={`${base.inner} ${base.faqLayout}`}>
              <div className={base.faqIntro}>
                <SectionTag>FAQ</SectionTag>
                <h2>Häufige Fragen</h2>
              </div>
              <WebsiteUmzugFaq items={faq} />
            </div>
          </section>
      </div>
      </main>
      <UmzugFooter items={navItems} />
      <BottomNav items={navItems} active={active} />
    </div>
  );
}
