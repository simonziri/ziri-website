"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import styles from "./testimonials.module.css";

const AUTOPLAY_DURATION = 6500;

type PixelStyle = CSSProperties & { "--pixel-delay": string };

const clients = [
  { name: "Simplesense", src: "/assets/simplesense.svg", width: 153, height: 26 },
  { name: "Leapsome", src: "/assets/leapsome.svg", width: 123, height: 28 },
  { name: "HockeyStack", src: "/assets/hockeystack-wordmark.svg", width: 145, height: 19 },
  { name: "Instaffo", src: "/assets/instaffo.svg", width: 107, height: 23 },
  { name: "Circula", src: "/assets/circula-testimonial.svg", width: 111, height: 21 },
] as const;

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % clients.length);
      setCycle((current) => current + 1);
    }, AUTOPLAY_DURATION);

    return () => window.clearTimeout(timer);
  }, [active, cycle, paused]);

  useEffect(() => {
    const panelElement = panelRef.current;
    if (!panelElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scrambleScope = panelElement;

    let cancelled = false;
    const cleanups: Array<() => void> = [];
    const splits: Array<{ revert: () => void }> = [];
    const animations: Array<{ kill: () => void }> = [];

    const initializeScramble = async () => {
      const [{ gsap }, { ScrambleTextPlugin }, { SplitText }, { ScrollTrigger }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrambleTextPlugin"),
          import("gsap/SplitText"),
          import("gsap/ScrollTrigger"),
        ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

      // Osmo Supply: Text Scramble (Load, Scroll, Hover)
      function initScrambleOnLoad() {
        const targets = scrambleScope.querySelectorAll<HTMLElement>('[data-scramble="load"]');

        targets.forEach((target) => {
          const split = new SplitText(target, {
            type: "words, chars",
            wordsClass: "word",
            charsClass: "char",
          });
          splits.push(split);

          const animation = gsap.to(split.words, {
            duration: 1.2,
            stagger: 0.01,
            scrambleText: {
              text: "{original}",
              chars: "upperCase",
              speed: 0.85,
            },
            onComplete: () => split.revert(),
          });
          animations.push(animation);
        });
      }

      function initScrambleOnScroll() {
        const targets = scrambleScope.querySelectorAll<HTMLElement>('[data-scramble="scroll"]');

        targets.forEach((target) => {
          const isAlternative = target.hasAttribute("data-scramble-alt");
          const split = new SplitText(target, {
            type: "words, chars",
            wordsClass: "word",
            charsClass: "char",
          });
          splits.push(split);

          const animation = gsap.to(split.words, {
            duration: 1.4,
            stagger: 0.015,
            scrambleText: {
              text: "{original}",
              chars: isAlternative ? "▯|" : "upperCase",
              speed: 0.95,
            },
            scrollTrigger: {
              trigger: target,
              start: "top bottom",
              once: true,
            },
            onComplete: () => split.revert(),
          });
          animations.push(animation);
        });
      }

      function initScrambleOnHover() {
        const targets = scrambleScope.querySelectorAll<HTMLElement>(
          '[data-scramble-hover="link"]',
        );

        targets.forEach((target) => {
          const textElement = target.querySelector<HTMLElement>(
            '[data-scramble-hover="target"]',
          );
          if (!textElement) return;

          const originalText = textElement.textContent ?? "";
          const customHoverText = textElement.getAttribute("data-scramble-text");
          const split = new SplitText(textElement, {
            type: "words, chars",
            wordsClass: "word",
            charsClass: "char",
          });
          splits.push(split);

          const enter = () => {
            gsap.to(textElement, {
              duration: 1,
              scrambleText: {
                text: customHoverText || originalText,
                chars: "◊▯∆|",
              },
            });
          };
          const leave = () => {
            gsap.to(textElement, {
              duration: 0.6,
              scrambleText: {
                text: originalText,
                speed: 2,
                chars: "◊▯∆",
              },
            });
          };

          target.addEventListener("mouseenter", enter);
          target.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            target.removeEventListener("mouseenter", enter);
            target.removeEventListener("mouseleave", leave);
          });
        });
      }

      initScrambleOnLoad();
      initScrambleOnScroll();
      initScrambleOnHover();
    };

    void initializeScramble();

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
      animations.forEach((animation) => animation.kill());
      splits.forEach((split) => split.revert());
    };
  }, [active, cycle]);

  const selectTab = (index: number) => {
    setActive(index);
    setCycle((current) => current + 1);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % clients.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + clients.length) % clients.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = clients.length - 1;
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
        {clients.map((client, index) => (
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
                width={client.width}
                height={client.height}
              />
            </span>
          </button>
        ))}
      </div>

      <div
        className={styles.panel}
        id="testimonial-panel"
        ref={panelRef}
        role="tabpanel"
        aria-live="polite"
        aria-label={`${clients[active].name} testimonial`}
        key={`${active}-${cycle}`}
      >
        <div className={styles.pixelTransition} aria-hidden="true">
          {Array.from({ length: 32 }, (_, index) => {
            const style: PixelStyle = {
              "--pixel-delay": `${((index * 17) % 32) * 13}ms`,
            };
            return <i key={index} style={style} />;
          })}
        </div>
        <span className={styles.headshotFrame}>
          <Image
            className={styles.headshot}
            src="/assets/eric-kanagy.png"
            alt="Eric Kanagy"
            fill
            sizes="61px"
          />
        </span>
        <blockquote data-scramble="load">
          “They rapidly got up to speed on our problem and solution set and cut
          through the complexity to create a design that cleanly tells our story to
          an outside audience.”
        </blockquote>
        <Link href="#featured-work" data-scramble-hover="link">
          <span data-scramble-text="Read Case Study" data-scramble-hover="target">
            Read Case Study
          </span>
        </Link>
        <p className={styles.author} data-scramble="scroll" data-scramble-alt="">
          Eric Kanagy, CEO &amp; Founder Simplesense
        </p>
      </div>
    </section>
  );
}
