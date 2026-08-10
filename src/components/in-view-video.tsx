"use client";

import { useEffect, useRef } from "react";

type InViewVideoProps = {
  className?: string;
  src: string;
  label: string;
};

export function InViewVideo({ className, src, label }: InViewVideoProps) {
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

        if (!reduceMotion.matches) {
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
  }, [src]);

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
