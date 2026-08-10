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
  { name: "Simplesense", src: "/assets/tab-logos/Simplesense.svg" },
  { name: "Leapsome", src: "/assets/tab-logos/Leapsome.svg" },
  { name: "HockeyStack", src: "/assets/tab-logos/HockeyStack.svg" },
  { name: "Instaffo", src: "/assets/tab-logos/Instaffo.svg" },
  { name: "Circula", src: "/assets/tab-logos/Circula.svg" },
] as const;

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visibleClients = mobile ? clients.slice(0, 4) : clients;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 47.9375rem)");
    const update = () => setMobile(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (active >= visibleClients.length) setActive(0);
  }, [active, visibleClients.length]);

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
        aria-label={`${visibleClients[active]?.name ?? visibleClients[0].name} testimonial`}
        key={`${active}-${cycle}`}
      >
        <span className={styles.headshotFrame}>
          <img
            className={styles.headshot}
            src="/assets/eric-kanagy.png"
            alt="Eric Kanagy"
            width={61}
            height={59}
          />
        </span>
        <blockquote>
          “They rapidly got up to speed on our problem and solution set and cut
          through the complexity to create a design that cleanly tells our story to
          an outside audience.”
        </blockquote>
        <Link href="#featured-work">Read Case Study</Link>
        <p className={styles.author}>
          Eric Kanagy, CEO &amp; Founder Simplesense
        </p>
      </div>
    </section>
  );
}
