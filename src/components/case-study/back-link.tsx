"use client";

import Link from "next/link";

/**
 * "Back to Homepage" link. Inside the panel it closes via history.back() —
 * the panel can only exist through an intercepted navigation, so the
 * previous entry is always the homepage (Next Case uses replace).
 */
export function BackLink({
  inPanel,
  className,
  children,
}: {
  inPanel: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!inPanel) {
    return (
      <Link className={className} href="/">
        {children}
      </Link>
    );
  }

  // Das Panel fängt [data-panel-close]-Klicks ab und spielt erst die
  // Slide-out-Animation, bevor es zurück navigiert.
  return (
    <a className={className} href="/" data-panel-close="">
      {children}
    </a>
  );
}
