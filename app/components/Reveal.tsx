"use client";

import { animate, utils } from "animejs";
import { type ElementType, type ReactNode, useEffect, useRef } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  stagger?: number;
  childSelector?: string;
  once?: boolean;
}

export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 40,
  duration = 800,
  stagger: staggerStep,
  childSelector,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (childSelector) {
      const children = Array.from(
        el.querySelectorAll<HTMLElement>(childSelector),
      );
      utils.set(children, { opacity: 0, translateY: y });
    } else {
      utils.set(el, { opacity: 0, translateY: y });
    }

    let played = false;
    const play = () => {
      if (played && once) return;
      played = true;
      if (childSelector) {
        const children = Array.from(
          el.querySelectorAll<HTMLElement>(childSelector),
        );
        const step = staggerStep ?? 80;
        animate(children, {
          opacity: [0, 1],
          translateY: [y, 0],
          duration,
          delay: (_t: unknown, i: number) => delay + i * step,
          ease: "outExpo",
        });
      } else {
        animate(el, {
          opacity: [0, 1],
          translateY: [y, 0],
          duration,
          delay,
          ease: "outExpo",
        });
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            if (once) io.disconnect();
          } else if (!once) {
            played = false;
            if (childSelector) {
              el.querySelectorAll<HTMLElement>(childSelector).forEach((c) => {
                utils.set(c, { opacity: 0, translateY: y });
              });
            } else {
              utils.set(el, { opacity: 0, translateY: y });
            }
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y, duration, staggerStep, childSelector, once]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
