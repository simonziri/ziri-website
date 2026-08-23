"use client";

import { useEffect, useRef } from "react";

type InViewVideoProps = {
  className?: string;
  src: string;
  label: string;
  /** Lädt das Video, springt zum letzten Frame und spielt nie ab. */
  freezeAtEnd?: boolean;
};

export function InViewVideo({ className, src, label, freezeAtEnd = false }: InViewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !entry.isIntersecting) return;

        if (!video.getAttribute("src")) {
          video.src = src;
          video.load();
        }

        if (freezeAtEnd) {
          const seekToEnd = () => {
            if (Number.isFinite(video.duration)) {
              video.currentTime = Math.max(video.duration - 0.05, 0);
            }
          };
          if (video.readyState >= 1) seekToEnd();
          else video.addEventListener("loadedmetadata", seekToEnd, { once: true });
        } else if (!reduceMotion.matches) {
          void video.play().catch(() => undefined);
        }

        observer.unobserve(video);
      },
      { rootMargin: "80px 0px", threshold: 0.35 },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [src, freezeAtEnd]);

  return (
    <video
      ref={videoRef}
      className={className}
      aria-label={label}
      muted
      playsInline
      preload="none"
    />
  );
}
