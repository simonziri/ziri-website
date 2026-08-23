# ZIRI Website 2026

**Neue Session? Zuerst HANDOFF.md lesen** — aktueller Projektstand,
offene TODOs, Architektur-Fallen und Arbeitsweise.

Next.js 16 (App Router) + TypeScript + CSS Modules + GSAP + shaders (WebGPU).
Design tokens live in `src/styles/tokens.css` — always style with tokens, never
raw hex values (exception: deliberate one-offs already in the codebase).
Max font-weight for non-mono text is 420; regular is 400. Mono labels use
`ui-monospace` at weight 480.

## Legal pages MUST track feature changes

`src/app/privacy/page.tsx` (privacy policy) and `src/app/imprint/page.tsx`
describe exactly what this site does with data. **Whenever you — human or
LLM — add, remove, or change anything that affects data processing, you must
update the privacy policy in the same change.** This includes, for example:

- Connecting analytics or tracking (GA4, Plausible, Meta Pixel, LinkedIn
  Insight, etc.) → add a section describing the tool, legal basis, data
  shared, and (if required) wire it to a consent mechanism first.
- New third-party embeds (video, maps, chat widgets, schedulers).
- New form fields or changes to where form submissions are delivered
  (see `src/app/api/contact/route.ts` — delivery targets are env-driven).
- New cookies, localStorage use with personal data, or fingerprinting.
- Changing hosting or adding processors (currently: Vercel).

Do not silently ship such a feature without the corresponding privacy-policy
edit. If the change requires prior consent (e.g. GA4), implementing a consent
step is part of the feature, not an optional follow-up.

## Contact form

- UI: `src/components/contact-form.tsx` (inside the CTA card, dark section,
  light-theme island).
- API: `src/app/api/contact/route.ts`. Stores nothing; forwards submissions.
  Delivery order: Resend e-mail (`RESEND_API_KEY`, target
  `CONTACT_EMAIL_TO`, default simon+contact@simonziri.com) → webhook
  (`CONTACT_WEBHOOK_URL`) → server log (dev fallback).
- GDPR invariants to preserve: data minimization, required consent checkbox,
  honeypot instead of captcha, no third-party embeds in the form.
- Successful submits dispatch `window` CustomEvent `ziri:contact:submitted` —
  attach tracking there, do not edit the form for analytics.

## Deployment

GitHub `simonziri/ziri-website` → Vercel auto-deploy on push to `main`.
Production domain will be simonziri.com after the DNS switch (GoDaddy).
