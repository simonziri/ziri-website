import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import styles from "./pixel-hatch-button.module.css";

type PixelVariant = "primary" | "secondary" | "icon";

type PixelHatchButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  ariaLabel?: string;
  variant?: PixelVariant;
  disabled?: boolean;
  /** Externe Links: öffnet in neuem Tab mit rel noopener/noreferrer */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type PixelStyle = CSSProperties & {
  "--ph-enter-delay": string;
  "--ph-exit-delay": string;
  "--px"?: string;
};

const COLS = 24;
const ROWS = 6;
const SPREAD = 150;
const JITTER = 40;
const ACCENTS = ["#d69cd5", "#ff765a"] as const;

const pixels = Array.from({ length: COLS * ROWS }, (_, index) => {
  const row = Math.floor(index / COLS);
  const column = index % COLS;
  const jitter = (index * 29 + row * 17) % JITTER;
  const enter = Math.round((column / (COLS - 1)) * SPREAD + jitter);
  const isEdge = row === 0 || row === ROWS - 1 || column === 0 || column === COLS - 1;
  const hasAccent = isEdge && (index * 7 + row) % 11 === 0;
  const style: PixelStyle = {
    "--ph-enter-delay": `${enter}ms`,
    "--ph-exit-delay": `${SPREAD + JITTER - enter}ms`,
  };

  if (hasAccent) {
    style["--px"] = ACCENTS[(index + row) % ACCENTS.length];
  }

  return { index, style };
});

export function PixelHatchButton({
  children,
  className,
  href,
  ariaLabel,
  variant = "primary",
  disabled = false,
  external = false,
  onClick,
}: PixelHatchButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");
  const content = (
    <>
      <span className={styles.pixels} aria-hidden="true">
        {pixels.map((pixel) => (
          <i key={pixel.index} style={pixel.style} />
        ))}
      </span>
      <span className={styles.label}>
        <span className={styles.track}>
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        className={classes}
        href={href}
        aria-label={ariaLabel}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
