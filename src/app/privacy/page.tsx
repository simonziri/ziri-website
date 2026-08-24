import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import legal from "../legal.module.css";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | ZIRI",
  description: "How ZIRI handles personal data on this website.",
};

/*
 * WICHTIG (siehe CLAUDE.md): Diese Seite beschreibt exakt, was die Website
 * tatsächlich tut. Jede Änderung an Datenverarbeitung (Analytics wie GA4,
 * neue Embeds, neue Formularfelder, neue Empfänger) MUSS hier im selben
 * Change nachgezogen werden.
 */
export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SiteHeader />
        <article className={legal.article}>
          <h1>Privacy Policy</h1>
          <p className={legal.updated}>Last updated: August 23, 2026</p>

          <p>
            This website is intentionally light on data. No advertising
            cookies, no analytics, no third-party fonts. Below is a complete
            account of what happens with personal data when you visit
            simonziri.com, written to be read, not just filed.
          </p>

          <h2>1. Controller</h2>
          <p>
            Responsible for data processing on this website (see{" "}
            <a href="/imprint">Imprint</a>):
          </p>
          <p>
            <strong>ZIRI GmbH</strong>
            <br />
            <span>Germanenweg 49</span>
            <br />
            <span>71272 Renningen</span>
            <br />
            <span>Germany</span>
            <br />
            E-mail: simon@simonziri.com
          </p>

          <h2>2. Hosting (Vercel)</h2>
          <p>
            This website is hosted by Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, USA. When you visit the site, Vercel processes
            technical connection data (IP address, date and time of access,
            requested URL, browser and operating system information) in server
            logs. This is technically necessary to deliver the website and to
            keep it secure.
          </p>
          <p>
            Legal basis: Art. 6(1)(f) GDPR — our legitimate interest in
            providing a secure, functioning website. Vercel may process data in
            the USA; transfers are safeguarded by the EU Standard Contractual
            Clauses and Vercel&rsquo;s participation in the EU-U.S. Data
            Privacy Framework. Log data is automatically deleted by Vercel
            after a short retention period.
          </p>

          <h2>3. Contact form</h2>
          <p>When you use the contact form, we process the data you enter:</p>
          <ul>
            <li>your work e-mail address (required)</li>
            <li>your company website (optional)</li>
            <li>
              your answers to the qualification questions and anything you
              write in the message field (optional)
            </li>
          </ul>
          <p>
            We use this data exclusively to respond to your inquiry and to
            prepare a potential collaboration. Submissions are{" "}
            <strong>not stored on the web server</strong> — they are forwarded
            directly to our e-mail inbox and kept there for as long as the
            correspondence requires, at most until the statutory retention
            periods expire.
          </p>
          <p>
            Legal basis: Art. 6(1)(b) GDPR (steps prior to entering into a
            contract, taken at your request) and your consent, Art. 6(1)(a)
            GDPR, which you give via the checkbox before sending. You can
            withdraw this consent at any time with effect for the future by
            e-mailing us. The form uses an invisible technical field to filter
            out automated spam; no captcha service and no third party is
            involved.
          </p>

          <h2>4. Embedded videos (YouTube)</h2>
          <p>
            Individual case study pages embed videos via YouTube&rsquo;s
            privacy-enhanced player (youtube-nocookie.com), operated by Google
            Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Ireland. In
            this mode YouTube does not set advertising cookies before you play
            a video; when the player loads, your IP address is nevertheless
            transmitted to Google. If you start playback, Google may process
            usage data under its own{" "}
            <a
              href="https://policies.google.com/privacy"
              rel="noreferrer noopener"
              target="_blank"
            >
              privacy policy
            </a>
            .
          </p>
          <p>
            Legal basis: Art. 6(1)(f) GDPR — our legitimate interest in
            presenting our work; playback only happens on your initiative.
          </p>

          <h2>5. What this site does not do</h2>
          <ul>
            <li>No analytics or tracking tools (no Google Analytics, no pixels).</li>
            <li>No advertising or marketing cookies.</li>
            <li>
              No third-party fonts or CDNs — fonts are served from our own
              server.
            </li>
            <li>No profiling, no automated decision-making.</li>
          </ul>
          <p>
            Should we introduce such tools in the future (for example web
            analytics), we will update this policy beforehand and, where
            legally required, ask for your consent first.
          </p>

          <h2>6. Your rights</h2>
          <p>Under the GDPR you have the right to:</p>
          <ul>
            <li>access the personal data we hold about you (Art. 15),</li>
            <li>rectification of inaccurate data (Art. 16),</li>
            <li>erasure (Art. 17) and restriction of processing (Art. 18),</li>
            <li>data portability (Art. 20),</li>
            <li>
              object to processing based on legitimate interest (Art. 21),
            </li>
            <li>
              withdraw any consent at any time with effect for the future
              (Art. 7(3)).
            </li>
          </ul>
          <p>
            To exercise any of these rights, e-mail simon@simonziri.com. You
            also have the right to lodge a complaint with a data protection
            supervisory authority, in particular in the member state of your
            habitual residence.
          </p>

          <h2>7. Changes to this policy</h2>
          <p>
            We update this policy whenever the website&rsquo;s functionality
            changes in a way that affects personal data. The date above always
            reflects the current version.
          </p>
        </article>
        <SiteFooter />
      </div>
    </main>
  );
}
