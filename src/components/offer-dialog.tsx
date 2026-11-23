"use client";

import { useCallback, useEffect, useRef } from "react";
import { AuditOfferFlow, type OfferVariant } from "@/components/audit-offer-flow";
import styles from "@/app/training/training.module.css";

/**
 * Modal auf der Watch-Seite (Simon 23.11.): "Free audit" und "Video
 * breakdown" öffnen je ein eigenes Modal mit denselben Fragen
 * (AuditOfferFlow). Natives <dialog>: Fokus, Escape und Hintergrund-Sperre
 * macht der Browser.
 */
export function OfferDialog({
  slug,
  variant,
  open,
  onClose,
}: {
  slug: string;
  variant: Exclude<OfferVariant, "thanks">;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Neuer Schritt: nach oben scrollen (lange Schritte, z. B. Kalender)
  const onStepChange = useCallback(() => bodyRef.current?.scrollTo({ top: 0 }), []);

  return (
    <dialog
      ref={ref}
      className={styles.offerDialog}
      aria-label={variant === "audit" ? "Free website audit" : "Video breakdown"}
      onClose={onClose}
      onClick={(event) => {
        // Klick auf den Hintergrund schließt
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.offerDialogBody} ref={bodyRef}>
        <button type="button" className={styles.offerClose} aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
        {open ? <AuditOfferFlow slug={slug} variant={variant} onStepChange={onStepChange} /> : null}
      </div>
    </dialog>
  );
}
