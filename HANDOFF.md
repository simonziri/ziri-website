# HANDOFF — Projektstand ziri-website (Stand: 23.08.2026)

Kontext-Übergabe für neue Claude-Sessions. Zusammen mit CLAUDE.md lesen.

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

## DNS-Switch (finaler Schritt, erst wenn Simon es sagt)

GoDaddy-DNS, zwei Records ändern:
- A `@`: 198.202.211.1 (Webflow) → 76.76.21.21 (Vercel)
- CNAME `www`: cdn.webflow.com → cname.vercel-dns.com
Vorher: Domains im Vercel-Dashboard hinterlegen (simonziri.com + www),
TTL runtersetzen. Danach Webflow unpublishen. Vorher prüfen: Redirects
für alte Webflow-URLs? Sitemap + robots.txt fehlen noch → vor Launch bauen.

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
4. **Resend**: `RESEND_API_KEY` in Vercel setzen (Simon), sonst landen
   Formular-Anfragen nur im Server-Log. Ziel: simon+contact@simonziri.com.
   Nach Domain-Verifizierung `CONTACT_EMAIL_FROM` auf @simonziri.com.
5. **Imprint/Privacy**: gelb markierte Platzhalter (Adresse, USt-IdNr.)
   in `src/app/imprint/page.tsx` + `privacy/page.tsx` füllen (Simon).
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
  H2s: 45px/1.14, H3s 1.18, Absätze line-height 1.55 (Token relaxed).
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
