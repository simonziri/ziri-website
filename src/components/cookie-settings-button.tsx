"use client";

import { openConsentSettings } from "@/lib/consent";

/* Footer-Link "Cookie settings": öffnet das Consent-Banner erneut. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button className={className} type="button" onClick={openConsentSettings}>
      Cookie settings
    </button>
  );
}
