"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import styles from "./testimonials.module.css";

const AUTOPLAY_DURATION = 6500;

const clients = [
  {
    name: "simplesense",
    src: "/assets/tab-logos/Simplesense.svg",
    caseSlug: "simplesense",
    quote:
      "“They rapidly got up to speed on our problem and solution set and cut through the complexity to create a design that cleanly tells our story to an outside audience.”",
    author: "Eric Kanagy",
    role: "CEO & Founder, simplesense",
    avatar: "/assets/eric-kanagy.png",
  },
  {
    name: "HockeyStack",
    src: "/assets/tab-logos/HockeyStack.svg",
    caseSlug: "hockeystack",
    quote:
      "“Hey, just wanted to let you know that ZIRI is amazing. Absolutely stellar work. Thank you for the rec!”",
    author: "Claudia Ring",
    role: "VP of Marketing, HockeyStack",
    avatar: "/assets/testimonials/claudia-ring.avif",
  },
  {
    name: "Instaffo",
    src: "/assets/tab-logos/Instaffo.svg",
    caseSlug: "instaffo",
    quote:
      "“We're super happy with the result. Thanks for your work.”",
    author: "Christoph Zoeller",
    role: "CEO, Instaffo",
    avatar: "/assets/testimonials/christoph-zoeller.avif",
  },
  {
    name: "Notus",
    src: "/assets/tab-logos/Notus.svg",
    caseSlug: "notus",
    quote:
      "“ZIRI, appreciate you. Really happy with the results and working with you guys.”",
    author: "Marvin Sanginés",
    role: "Founder, Notus",
    avatar: "/assets/testimonials/marvin-sangines.avif",
  },
  {
    name: "onebio",
    src: "/assets/tab-logos/Onebio.svg",
    quote:
      "“THANK YOU. I’d like to forever and always work with you on web projects because of how smooth and precise feedback and implementation has been. Truly truly truly a gem.”",
    author: "Shuya Gong",
    role: "Co-Founder, onebio",
    avatar: "/assets/testimonials/shuya-gong.avif",
  },
] as const;

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visibleClients = clients;

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % visibleClients.length);
      setCycle((current) => current + 1);
    }, AUTOPLAY_DURATION);

    return () => window.clearTimeout(timer);
  }, [active, cycle, paused, visibleClients.length]);

  const selectTab = (index: number) => {
    setActive(index);
    setCycle((current) => current + 1);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % visibleClients.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + visibleClients.length) % visibleClients.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = visibleClients.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    selectTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const current = visibleClients[active] ?? visibleClients[0];

  return (
    <section
      className={styles.section}
      id="testimonials"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className={styles.tabs} role="tablist" aria-label="Choose a client testimonial">
        {visibleClients.map((client, index) => (
          <button
            className={styles.tab}
            data-active={active === index}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls="testimonial-panel"
            tabIndex={active === index ? 0 : -1}
            onClick={() => selectTab(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            key={client.name}
          >
            {active === index ? (
              <span
                className={styles.progress}
                style={{ animationDuration: `${AUTOPLAY_DURATION}ms` }}
                key={`${active}-${cycle}`}
                aria-hidden="true"
              />
            ) : null}
            <span className={styles.tabLogo}>
              <Image
                src={client.src}
                alt={client.name}
                width={262}
                height={58}
              />
            </span>
          </button>
        ))}
      </div>

      <div
        className={styles.panel}
        id="testimonial-panel"
        role="tabpanel"
        aria-live="polite"
        aria-label={`${current.name} testimonial`}
        key={`${active}-${cycle}`}
      >
        {"avatar" in current && current.avatar ? (
          <span className={styles.headshotFrame}>
            <img
              className={styles.headshot}
              src={current.avatar}
              alt={current.author}
              width={61}
              height={59}
            />
          </span>
        ) : null}
        <blockquote>{current.quote}</blockquote>
        <div className={styles.panelFooter}>
          <p className={styles.author}>
            {current.author}, {current.role}
          </p>
          {"caseSlug" in current ? (
            <Link href={`/work/${current.caseSlug}`} scroll={false}>
              Read case study <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
