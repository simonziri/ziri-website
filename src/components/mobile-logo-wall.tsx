"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./home-sections.module.css";

const logos = [
  {
    name: "HockeyStack",
    content: (
      <span className={styles.mobileHockeyStackLogo}>
        <Image src="/assets/hockeystack.svg" alt="" width={10} height={11} />
        <Image
          src="/assets/hockeystack-wordmark.svg"
          alt="HockeyStack"
          width={89}
          height={14}
        />
      </span>
    ),
  },
  {
    name: "Leapsome",
    content: (
      <Image
        src="/assets/leapsome.svg"
        alt="Leapsome"
        width={75}
        height={17}
      />
    ),
  },
  {
    name: "Circula",
    content: (
      <Image
        src="/assets/circula.svg"
        alt="Circula"
        width={134}
        height={44}
      />
    ),
  },
  {
    name: "Instaffo",
    content: (
      <Image
        src="/assets/instaffo.svg"
        alt="Instaffo"
        width={65}
        height={14}
      />
    ),
  },
] as const;

export function MobileLogoWall() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const mobile = window.matchMedia("(max-width: 47.9375rem)");
    if (!root || !mobile.matches) return;

    let cancelled = false;
    let cleanup = () => {};

    const initialize = async () => {
      const [{ gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/CustomEase"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create("ziriGlobalEase", "0.625,0.05,0,1");

      const loopDelay = 1.5;
      const duration = 0.9;
      const list = root.querySelector<HTMLElement>("[data-logo-wall-list]");
      if (!list) return;

      const items = Array.from(list.querySelectorAll<HTMLElement>("[data-logo-wall-item]"));
      const shuffleFront = root.getAttribute("data-logo-wall-shuffle") !== "false";
      const originalTargets = items
        .map((item) => item.querySelector<HTMLElement>("[data-logo-wall-target]"))
        .filter((target): target is HTMLElement => Boolean(target));

      let visibleItems: HTMLElement[] = [];
      let visibleCount = 0;
      let pool: HTMLElement[] = [];
      let pattern: number[] = [];
      let patternIndex = 0;
      let timeline: ReturnType<typeof gsap.timeline> | undefined;

      function isVisible(element: HTMLElement) {
        return window.getComputedStyle(element).display !== "none";
      }

      function shuffleArray<T>(array: T[]) {
        const copy = array.slice();
        for (let index = copy.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
        }
        return copy;
      }

      function swapNext() {
        const currentCount = items.filter(isVisible).length;
        if (currentCount !== visibleCount) {
          setup();
          return;
        }
        if (!pool.length || !visibleCount) return;

        const itemIndex = pattern[patternIndex % visibleCount];
        patternIndex += 1;
        const container = visibleItems[itemIndex];
        const parent =
          container.querySelector<HTMLElement>("[data-logo-wall-target-parent]") ||
          container;
        const existing = parent.querySelectorAll<HTMLElement>("[data-logo-wall-target]");
        if (existing.length > 1) return;

        const current = parent.querySelector<HTMLElement>("[data-logo-wall-target]");
        const incoming = pool.shift();
        if (!incoming) return;

        gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
        parent.appendChild(incoming);

        if (current) {
          gsap.to(current, {
            yPercent: -50,
            autoAlpha: 0,
            duration,
            ease: "ziriGlobalEase",
            onComplete: () => {
              current.remove();
              pool.push(current);
            },
          });
        }

        gsap.to(incoming, {
          yPercent: 0,
          autoAlpha: 1,
          duration,
          delay: 0.1,
          ease: "ziriGlobalEase",
        });
      }

      function setup() {
        timeline?.kill();
        visibleItems = items.filter(isVisible);
        visibleCount = visibleItems.length;
        if (!visibleCount) return;

        pattern = shuffleArray(Array.from({ length: visibleCount }, (_, index) => index));
        patternIndex = 0;

        items.forEach((item) => {
          item.querySelectorAll("[data-logo-wall-target]").forEach((target) => target.remove());
        });

        pool = originalTargets.map((target) => target.cloneNode(true) as HTMLElement);
        let front: HTMLElement[];
        let rest: HTMLElement[];

        if (shuffleFront) {
          const shuffled = shuffleArray(pool);
          front = shuffled.slice(0, visibleCount);
          rest = shuffleArray(shuffled.slice(visibleCount));
        } else {
          front = pool.slice(0, visibleCount);
          rest = shuffleArray(pool.slice(visibleCount));
        }
        pool = front.concat(rest);

        visibleItems.forEach((item) => {
          const parent =
            item.querySelector<HTMLElement>("[data-logo-wall-target-parent]") || item;
          const target = pool.shift();
          if (target) parent.appendChild(target);
        });

        timeline = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
        timeline.call(swapNext);
        timeline.play();
      }

      setup();

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => timeline?.play(),
        onLeave: () => timeline?.pause(),
        onEnterBack: () => timeline?.play(),
        onLeaveBack: () => timeline?.pause(),
      });

      const handleVisibilityChange = () => {
        if (document.hidden) timeline?.pause();
        else timeline?.play();
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      cleanup = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        trigger.kill();
        timeline?.kill();
        gsap.killTweensOf(root.querySelectorAll("[data-logo-wall-target]"));
      };
    };

    void initialize();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div
      className={styles.mobileLogoWall}
      data-logo-wall-shuffle="false"
      data-logo-wall-cycle-init=""
      aria-label="Selected ZIRI clients"
      ref={rootRef}
    >
      <div className={styles.mobileLogoCollection}>
        <div className={styles.mobileLogoList} data-logo-wall-list="">
          {logos.map((logo) => (
            <div className={styles.mobileLogoItem} data-logo-wall-item="" key={logo.name}>
              <div className={styles.mobileLogoSlot} data-logo-wall-target-parent="">
                <span className={styles.mobileLogoBefore} aria-hidden="true" />
                <span className={styles.mobileLogoTarget} data-logo-wall-target="">
                  {logo.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
