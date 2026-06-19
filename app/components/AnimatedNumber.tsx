"use client";

import { animate } from "animejs";
import { useEffect, useRef } from "react";
import { formatEuro } from "../lib/propale";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 700,
  format = formatEuro,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const objRef = useRef({ v: 0 });
  const targetRef = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    targetRef.current = value;
    const controls = animate(objRef.current, {
      v: value,
      duration,
      ease: "outExpo",
      onUpdate: () => {
        if (targetRef.current === value) {
          el.textContent = format(objRef.current.v);
        }
      },
    });
    return () => {
      controls?.pause?.();
    };
  }, [value, duration, format]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
