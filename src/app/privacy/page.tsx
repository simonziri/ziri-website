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
 * Change nachgezogen werden. GA4, Clarity, Meta Pixel + Consent-Banner:
 * Abschnitte 7, 7a, 7b und 8, Code in src/components/consent-banner.tsx,
 * src/lib/consent.ts und src/lib/analytics.ts.
 */
export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SiteHeader />
        <article className={legal.article}>
          <h1>Privacy Policy</h1>
          <p className={legal.updated}>Last updated: October 11, 2026</p>

          <p>
            This website is intentionally light on data. No third-party fonts,
            and web analytics and advertising measurement only if you allow
            it. Below is a complete
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

          <h2 id="training">4. Training sign-up form</h2>
          <p>
            When you sign up for one of our free recorded trainings, we
            process:
          </p>
          <ul>
            <li>your work e-mail address</li>
            <li>your answer to one short question: your role</li>
            <li>
              whether you also want our newsletter (optional, separate
              checkbox; you only receive it after confirming via a link we
              e-mail you, and you can unsubscribe at any time)
            </li>
            <li>
              which training you signed up for and, if the link you arrived
              through contained them, the campaign parameters utm_source,
              utm_campaign and utm_content (these tell us which ad or post
              brought you to the page; they are read from the address bar,
              no cookies are set)
            </li>
          </ul>
          <p>
            We use this data to send you the training and to follow up with you
            about it. Submissions are <strong>not stored on the web
            server</strong>; they are forwarded directly to our e-mail inbox,
            to our e-mail service provider beehiiv and to our CRM Pipedrive
            (see below). We keep them for as long as needed to deliver the
            training and follow up on it. If no further exchange with you follows, we delete
            them no later than 12 months after our last contact with you, or
            earlier if you withdraw your consent. If a business conversation
            develops from it, we keep your details for as long as that
            relationship requires and as statutory retention periods demand.
          </p>
          <p>
            Legal basis: your consent, Art. 6(1)(a) GDPR, which you give via
            the checkbox before sending. You can withdraw it at any time with
            effect for the future by e-mailing us. As with the contact form, an
            invisible technical field filters out automated spam; no captcha
            service is involved.
          </p>
          <p>We use two processors for the training sign-up:</p>
          <ul>
            {/* TODO(Simon): verify addresses and transfer mechanism (SCCs / EU-U.S. Data Privacy Framework) against the signed DPAs. */}
            <li>
              <strong>beehiiv</strong> (beehiiv Inc., USA), our e-mail service
              provider. We use it to send you the training and, only if you
              ticked the separate newsletter checkbox and confirmed via the
              link, our newsletter. beehiiv receives your e-mail address, your
              role, the training, whether you opted in to the newsletter and
              the campaign parameters. beehiiv may process data in the USA;
              transfers are safeguarded by the EU Standard Contractual
              Clauses.
            </li>
            <li>
              <strong>Pipedrive</strong> (Pipedrive OÜ, Mustamäe tee 3a, 10615
              Tallinn, Estonia), our CRM. We use it to keep track of sign-ups
              and our follow-up. Pipedrive receives the same data as listed
              above.
            </li>
          </ul>
          <p>
            Both process the data on our behalf under a data processing
            agreement.
          </p>

          <h2>5. E-mail delivery (Resend)</h2>
          <p>
            Submissions from the contact form and the training sign-up form are
            delivered to our inbox via Resend (Resend, Inc., 2261 Market Street
            #5039, San Francisco, CA 94114, USA), which processes the
            submitted data on our behalf under a data processing agreement.
            Resend may process data in the USA; transfers are safeguarded by
            the EU Standard Contractual Clauses.
          </p>

          <h2>6. Embedded videos (YouTube)</h2>
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

          <h2 id="analytics">7. Google Analytics 4 (only with your consent)</h2>
          <p>
            If you allow &ldquo;Statistics&rdquo; in our privacy banner, we use
            Google Analytics 4, a web analytics service of Google Ireland
            Limited, Gordon House, Barrow Street, Dublin 4, Ireland
            (&ldquo;Google&rdquo;). We load it through Google Tag Manager, a
            tool from the same provider that loads the analytics script.
            Without your consent to &ldquo;Statistics&rdquo;, Google Analytics
            does not run. Google Tag Manager itself is only loaded once you
            allow &ldquo;Statistics&rdquo; or &ldquo;Marketing&rdquo; (see
            section 7b); before that, no data is sent to Google.
          </p>
          {/* TODO(Simon): verify that the Google Ads Data Processing Terms are accepted in the GA4 account (Admin > Account settings) so Google acts as our processor. */}
          <p>
            Google processes the data on our behalf as a processor under
            Google&rsquo;s data processing terms (Art. 28 GDPR).
          </p>
          <p>
            Purpose: we want to understand how visitors use this site, which
            pages are read, and which campaigns bring visitors and sign-ups.
            When you send the contact form or sign up for a training, we record
            that a sign-up happened (and for which training), not what you
            entered.
          </p>
          <p>Data processed:</p>
          <ul>
            <li>
              pseudonymous identifiers stored in the cookies{" "}
              <code>_ga</code> and <code>_ga_&lt;id&gt;</code>, which recognize
              your browser across visits and sessions
            </li>
            <li>
              usage data such as pages viewed, time of the visit, scrolling,
              clicks on outbound links and file downloads
            </li>
            {/* TODO(Simon): verify the IP wording against Google's current EU data processing description for GA4. */}
            <li>
              your IP address, which Google uses on servers in the EU only to
              derive an approximate location (country, region, city) and then
              discards; Google Analytics 4 does not store full IP addresses
            </li>
            <li>device type, operating system, browser and screen size</li>
            <li>
              the referring website and campaign parameters in the link you
              arrived through (for example utm_source or utm_campaign)
            </li>
          </ul>
          <p>
            Google signals and ad personalization are turned off. We do not
            combine this data with other data about you.
          </p>
          <p>
            Legal basis: your consent, Art. 6(1)(a) GDPR, and for storing and
            reading the cookies on your device § 25(1) TDDDG.
          </p>
          {/* TODO(Simon): verify that Google LLC's DPF certification is current (dataprivacyframework.gov). */}
          <p>
            Google may transfer data to Google LLC in the USA. Google LLC is
            certified under the EU-U.S. Data Privacy Framework, for which the
            European Commission has issued an adequacy decision (Art. 45 GDPR).
          </p>
          <p>
            Retention: we have set the data retention in Google Analytics to 14
            months; after that, event data is deleted automatically. The
            cookies expire after at most 2 years.
          </p>
          <p>
            You can withdraw your consent at any time with effect for the
            future via the &ldquo;Cookie settings&rdquo; link in the footer of
            every page. When you withdraw, Google Analytics stops collecting
            data and we delete the <code>_ga</code> cookies from your browser.
            More in{" "}
            <a
              href="https://policies.google.com/privacy"
              rel="noreferrer noopener"
              target="_blank"
            >
              Google&rsquo;s privacy policy
            </a>
            .
          </p>

          <h2 id="clarity">7a. Microsoft Clarity (only with your consent)</h2>
          {/* TODO(Simon): verify Microsoft Clarity terms/DPA and masking settings in the Clarity project (Settings > Masking: at least Balanced). */}
          <p>
            If you allow &ldquo;Statistics&rdquo;, we also use Microsoft
            Clarity, a service of Microsoft Ireland Operations Limited, One
            Microsoft Place, South County Business Park, Leopardstown, Dublin
            18, Ireland. Clarity shows us how visitors interact with our pages
            through heatmaps and session recordings (mouse movements, clicks,
            scrolling). Text you type into form fields is masked and not
            recorded. Clarity sets the cookies <code>_clck</code> and{" "}
            <code>_clsk</code> (up to one year) and is loaded through Google
            Tag Manager, only after your consent.
          </p>
          <p>
            Purpose: to find out where our pages are unclear or hard to use and
            improve them. Legal basis: your consent, Art. 6(1)(a) GDPR and
            § 25(1) TDDDG. Data may be transferred to Microsoft Corporation in
            the USA, which is certified under the EU-US Data Privacy
            Framework. Microsoft keeps Clarity data for up to 13 months. You
            can withdraw your consent at any time via &ldquo;Cookie
            settings&rdquo; in the footer; Clarity then stops and its cookies
            are removed. More in{" "}
            <a
              href="https://privacy.microsoft.com/privacystatement"
              rel="noopener noreferrer"
              target="_blank"
            >
              Microsoft&rsquo;s privacy statement
            </a>
            .
          </p>

          <h2 id="meta-pixel">7b. Meta Pixel (only with your consent)</h2>
          <p>
            If you allow &ldquo;Marketing&rdquo; in our privacy banner, we use
            the Meta Pixel, a service of Meta Platforms Ireland Limited, Merrion
            Road, Dublin 4, D04 X2K5, Ireland (&ldquo;Meta&rdquo;). Like our
            analytics tools, it is loaded through Google Tag Manager (see
            section 7) and only after your consent. Without your consent, the Meta Pixel is not
            loaded and no data is sent to Meta.
          </p>
          <p>
            Purpose: to measure which of our ads on Facebook and Instagram lead
            to sign-ups, to optimise the delivery of our ads, and possibly to
            show our ads to people who have visited this site.
          </p>
          <p>Data processed:</p>
          <ul>
            <li>
              identifiers stored in the cookies <code>_fbp</code> and{" "}
              <code>_fbc</code>, which recognize your browser and the ad you
              clicked
            </li>
            <li>
              pixel events such as PageView (a page was viewed) and Lead (a
              sign-up happened, without what you entered in the form)
            </li>
            <li>your IP address</li>
            <li>browser and device information</li>
            <li>the URL of the page you are on</li>
          </ul>
          {/* TODO(Simon): verify that Meta's Controller Addendum is accepted in the Meta Business account (Events Manager / Business settings) and that the joint-controllership wording matches it. */}
          <p>
            For the collection of this data on our website and its
            transmission to Meta, we and Meta are joint controllers (Art. 26
            GDPR). We have agreed with Meta on the respective responsibilities
            in Meta&rsquo;s Controller Addendum; under it, Meta is the contact
            point for exercising your rights regarding this processing, though
            you can also contact us. The further processing of the data after
            the transmission is Meta&rsquo;s own responsibility.
          </p>
          <p>
            Legal basis: your consent, Art. 6(1)(a) GDPR, and for storing and
            reading the cookies on your device § 25(1) TDDDG.
          </p>
          {/* TODO(Simon): verify that Meta Platforms, Inc.'s DPF certification is current (dataprivacyframework.gov). */}
          <p>
            Meta may transfer data to Meta Platforms, Inc. in the USA. Meta
            Platforms, Inc. is certified under the EU-U.S. Data Privacy
            Framework, for which the European Commission has issued an
            adequacy decision (Art. 45 GDPR).
          </p>
          {/* TODO(Simon): verify cookie lifetime (_fbp / _fbc, currently 90 days by default) against Meta's documentation. */}
          <p>
            The cookies <code>_fbp</code> and <code>_fbc</code> expire after
            90 days. You can withdraw your consent at any time with effect for
            the future via the &ldquo;Cookie settings&rdquo; link in the footer
            of every page. When you withdraw, the Meta Pixel stops sending data
            and we delete the <code>_fbp</code> and <code>_fbc</code> cookies
            from your browser. More in{" "}
            <a
              href="https://www.facebook.com/privacy/policy/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Meta&rsquo;s privacy policy
            </a>
            .
          </p>

          <h2 id="consent">8. Consent management</h2>
          <p>
            Our privacy banner offers three categories: &ldquo;Necessary&rdquo;
            (always on, only stores your choice), &ldquo;Statistics&rdquo;
            (Google Analytics and Microsoft Clarity, see sections 7 and 7a) and
            &ldquo;Marketing&rdquo; (Meta Pixel, see section 7b). Google Tag
            Manager is loaded as soon as you allow at least one of Statistics
            or Marketing; each tool only runs for the category you allowed.
          </p>
          <p>
            When you make a choice in our privacy banner, we store it in your
            browser&rsquo;s local storage: which categories you allowed, a
            version number and the time of your choice. No cookie is set and
            nothing is sent to us or to anyone else. We need this so the site
            remembers your choice and does not ask again on every page.
          </p>
          {/* TODO(Simon): verify legal basis wording for storing the consent choice. */}
          <p>
            Legal basis: § 25(2) no. 2 TDDDG (strictly necessary to provide
            the service you requested) and Art. 6(1)(c) GDPR in conjunction
            with Art. 7(1) GDPR (we have to be able to show your consent). The
            entry stays until you change your choice or clear your browser
            storage.
          </p>

          <h2>9. What this site does not do</h2>
          <ul>
            <li>
              No analytics without your consent: Google Analytics and
              Microsoft Clarity only run after you allow it (see sections 7
              and 7a).
            </li>
            <li>
              No advertising pixels or marketing cookies without your consent:
              the Meta Pixel only runs after you allow it (see section 7b).
            </li>
            <li>
              No third-party fonts or CDNs — fonts are served from our own
              server.
            </li>
            <li>No profiling, no automated decision-making.</li>
          </ul>
          <p>
            Should we introduce further tools in the future, we will update
            this policy beforehand and,
            where legally required, ask for your consent first.
          </p>

          <h2>10. Your rights</h2>
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

          <h2>11. Changes to this policy</h2>
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
