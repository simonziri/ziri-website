# HANDOFF — Projektstand ziri-website (Stand: 25.08.2026)

Kontext-Übergabe für neue Claude-Sessions. Zusammen mit CLAUDE.md lesen.
Dieses Dokument LAUFEND aktuell halten (Simons Ansage); Changelog = Git-Log.

## Copy-Regeln (Simons Ansagen, bei jedem Text anwenden)

- Keine Em-Dashes (—) in Website-Copy; keine „AI-sloppy" Wörter
  (lands, go quiet, „not x but y"). „Simplesense" groß, CAC nicht CaC.
- text-wrap: H2 balance, H1/H3+ pretty. Line-heights: Hero-H1 1.2,
  H3 und kleiner 1.3, Testimonial-Quote 1.3.
- Simon editiert Copy auch selbst via GitHub-Web → vor jedem Push
  `git pull --rebase`; bei H1-/Positionierungs-Änderungen Meta-
  Description, OG-Text und JSON-LD-Slogan in layout.tsx MITZIEHEN
  (OG-Bild liefert er passend dazu).

## Was das ist

Neubau von simonziri.com (ZIRI — B2B-Web-Agentur, committee-driven sales).
Next.js 16 App Router, TypeScript, CSS Modules, WebGPU-Shader (Paket
`shaders`), Stack Sans Variable Font (lokal). Die alte Webflow-Site läuft
noch auf simonziri.com, bis der DNS-Switch kommt.

## Pipeline (funktioniert, nicht anfassen)

- `git push origin main` → GitHub `simonziri/ziri-website` → **Vercel
  deployt automatisch** (~40s). Projekt: simon-5243s-projects/ziri-website.
- Iterations-URL: https://ziri-website-simon-5243s-projects.vercel.app
  (hinter Vercel-Login/Deployment Protection — für Simon direkt offen).
- `vercel` CLI ist eingeloggt (simon-5243). `gh` CLI eingeloggt (simonziri).
- Dev-Server: Preview-Config "ziri-website" (Port 3000). Achtung: die
  launch.json der Session kann im ALTEN Arbeitsverzeichnis liegen.

## DNS-Switch: ERLEDIGT (26.08.) — Site ist LIVE

simonziri.com läuft auf Vercel (A `@` → 216.198.79.1, www → CNAME
vercel-dns; Apex 308-redirected auf www). Resend-Domain verifiziert
(DKIM + send-Subdomain-SPF bei GoDaddy). Restarbeiten:
- Webflow-Projekt unpublishen.
- DNS-Altlasten löschen: TXT `proxy-ssl.webflow.com` auf `@`,
  CNAME `de` → weglot.io (falls Weglot nicht mehr genutzt).
- Redirects für alte Webflow-URLs prüfen.

## Offene Punkte (TODO)

1. Thumbnails: alle fünf Live-Cases haben `thumbnail` + eigenen
   Featured-Work-Slide. Reihenfolge (Simons Ansage): Circula,
   simplesense, Leapsome, HockeyStack, Instaffo.
2. **Engagement-Types-Sektion** ist vorerst ausgeblendet (Simon denkt
   über den Inhalt nach) — Komponente existiert weiter, in
   `src/app/page.tsx` wieder einhängen wenn freigegeben.
3. **Draft-Cases** (scalera, notus, ideabay, analyst-house, spark):
   Content steht in `src/data/case-studies.ts`, Bilder fehlen. Bei
   Lieferung: Galerie füllen, `draft: true` entfernen.
4. **Resend läuft** (23.08.), Zustellung end-to-end getestet.
   `RESEND_API_KEY` + `CONTACT_EMAIL_TO=simon@simonziri.com` in Vercel
   Production. Einschränkung: Test-Absender onboarding@resend.dev darf
   NUR an die Resend-Account-Adresse senden. **Zielzustand (Simons
   Ansage 25.08.): hello@simonziri.com** — Code-Default steht schon
   darauf, wirksam erst wenn (a) Domain simonziri.com in Resend
   verifiziert ist (DKIM/SPF bei GoDaddy, geht vor dem DNS-Switch),
   (b) `CONTACT_EMAIL_FROM` auf @simonziri.com gesetzt und (c) die
   Vercel-Env `CONTACT_EMAIL_TO` auf hello@ geändert/entfernt wurde
   (Env überschreibt den Code-Default). Bis dahin weiter simon@.
5. **Imprint/Privacy**: vollständig (24.08.) — ZIRI GmbH, Renningen,
   USt-ID, Geschäftsführer Simon Merkt, Amtsgericht Stuttgart
   HRB 805923.
6. Testimonial-Sektion: Circula-Zitat ersetzt durch Notus (Marvin
   Sanginés) + onebio (Shuya Gong). Rolle „Co-Founder, onebio" von
   Simon bestätigen lassen (alte Website sagte Maybe Ventures).
7. Leapsome-Testimonial bewusst noch keins (Simons Ansage).
8. Sanity-Migration macht später der Dev (Basis: flowtricks/remarkable);
   Datenmodell in case-studies.ts ist CMS-ready gehalten.

## Architektur-Notizen (Dinge, die man leicht kaputt macht)

- **Case-Study-Panel**: Intercepting Route `@modal/(.)work/[slug]` —
  Homepage-Klick öffnet Slide-Panel (1.05s, ease-softer, Slide-out vor
  Navigation), Direktaufruf/Google bekommt echte Seite. „Next Case" nutzt
  `replace`, damit Back immer zur Homepage geht. Schließen orchestriert
  das Panel über `[data-panel-close]`.
- **Reveal-System** (`reveal-observer.tsx` + globals.css): [data-reveal=
  sweep|fade|rise|wipe], armiert per IntersectionObserver über sichtbare
  ELTERN (versteckte Elemente schneiden den Viewport nie). Sweep =
  Lovable-Gradient (3.6s). Section-Enter/Exit über benannte view-timeline
  pro Section (Kinder als Einheit), Exit hält erste 30%.
- **Hero-Dots** (`hero-dots.tsx`): DotGrid-Shader über Hero+FeaturedWork
  (dotsScope-Wrapper, FW-Hintergrund transparent!). Cursor-Zone = zwei
  Grids mit alpha/alphaInverted-Masken; Maus wird MANUELL getrackt
  (Library-Treiber bekommt keine Events); Density dynamisch (25px Pitch);
  Fade-in via onReady. dotSize 0.14/0.05, Opacity 0.5, Top-Maske 48%.
- **Bento-Galerie**: Spaltenbreiten = Seitenverhältnisse (fr), damit
  Reihenhöhen matchen. Bildmaße stehen in case-studies.ts (Layout-Shift).
- **Fonts/Weights**: max 420 (nicht-mono), Regular 400, Mono 480/400.
  Hero-H1 1.2, H2s 45px/1.14 (Paradox 1.2), H3 und kleiner 1.3
  (global + Module), Testimonial-Quote 1.3, Absätze 1.55 (relaxed).
- **Dark-Sektionen**: FAQ + Footer hart via data-theme="dark-primary"
  (Basis #050505). CTA (#contact) hat KEIN eigenes Theme mehr: die
  ganze Seite flippt per Scroll-Trigger (theme-scroll.tsx toggelt nur
  data-theme); die Überblendung machen permanente CSS-Transitions in
  globals.css (--theme-flip-duration, :where()-Regel). Form-Insel im
  CTA bleibt immer light-primary.
- **Kontaktformular**: siehe CLAUDE.md (GDPR-Invarianten!). Tracking nur
  über CustomEvent `ziri:contact:submitted` anhängen.
- **Paradox-Karte 3** eingefroren (freezeAtEnd) — nur 2 Videos laufen.

## Arbeitsweise mit Simon

- Feedback kommt oft diktiert (Tippfehler): sinnvoll interpretieren,
  Interpretationen transparent auflisten, bei echter Mehrdeutigkeit kurz
  nachfragen (AskUserQuestion mit konkreten Optionen).
- Nach jedem abgeschlossenen Batch: committen + pushen (Auto-Deploy),
  thematische Commit-Messages auf Englisch.
- Änderungen headless verifizieren (Messwerte/curl/Screenshots) und
  ehrlich sagen, was nur er visuell prüfen kann (Animations-Gefühl).
- Deutsch antworten. Figma-Datei „ZIRI Assets" (NISCbbBlszxYRX97VHzaAU)
  enthält Export-Templates-Section (inzwischen obsolet: Bilder kommen in
  Originalgröße). Shaders-MCP: Pro-Account vorhanden.
