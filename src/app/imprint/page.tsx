import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import legal from "../legal.module.css";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Imprint | ZIRI",
  description: "Legal disclosure for simonziri.com.",
};

/*
 * Gelb markierte Platzhalter vor dem DNS-Switch mit den echten Angaben
 * füllen (Adresse, ggf. USt-IdNr.). Siehe CLAUDE.md.
 */
export default function ImprintPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SiteHeader />
        <article className={legal.article}>
          <h1>Imprint</h1>
          <p className={legal.updated}>Information pursuant to § 5 DDG</p>

          <h2>Provider</h2>
          <p>
            <strong>ZIRI GmbH</strong>
            <br />
            <span>Germanenweg 49</span>
            <br />
            <span>71272 Renningen</span>
            <br />
            <span>Germany</span>
          </p>

          <h2>Contact</h2>
          <p>
            E-mail: simon@simonziri.com
            <br />
            Web: simonziri.com
          </p>

          <h2>Represented by</h2>
          <p>Managing Director: Simon Merkt</p>

          <h2>Commercial register</h2>
          <p>
            Registered at the local court (Amtsgericht) of Stuttgart
            <br />
            Registration number: HRB 805923
          </p>

          <h2>VAT ID</h2>
          <p>
            VAT identification number pursuant to § 27a UStG:{" "}
            <span>DE463152518</span>
          </p>

          <h2>Responsible for content</h2>
          <p>
            Simon Merkt (address as above), pursuant to § 18(2) MStV.
          </p>

          <h2>Liability for content</h2>
          <p>
            As a service provider we are responsible for our own content on
            these pages under general law. We are not obliged to monitor
            transmitted or stored third-party information or to investigate
            circumstances indicating illegal activity. Obligations to remove
            or block the use of information under general law remain
            unaffected; liability in this respect is only possible from the
            moment we become aware of a specific infringement. Upon
            notification of such violations, we will remove the content
            immediately.
          </p>

          <h2>Liability for links</h2>
          <p>
            This website contains links to external third-party websites over
            whose content we have no control. The respective provider or
            operator is always responsible for the content of linked pages.
            Linked pages were checked for possible legal violations at the
            time of linking; permanent monitoring of linked pages is not
            reasonable without concrete indications of an infringement. Upon
            notification of violations, we will remove such links immediately.
          </p>

          <h2>Copyright</h2>
          <p>
            The content and works created by the site operator on these pages
            are subject to German copyright law. Duplication, processing,
            distribution and any kind of exploitation outside the limits of
            copyright require the written consent of the respective author or
            creator. Client logos and project material shown in case studies
            remain the property of their respective owners and are used with
            permission.
          </p>

          <h2>Dispute resolution</h2>
          <p>
            We are neither willing nor obliged to participate in dispute
            resolution proceedings before a consumer arbitration board.
          </p>
        </article>
        <SiteFooter />
      </div>
    </main>
  );
}
