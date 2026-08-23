"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  if (!inPanel) {
    return (
      <Link className={className} href="/">
        {children}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href="/"
      onClick={(event) => {
        event.preventDefault();
        router.back();
      }}
    >
      {children}
    </a>
  );
}
