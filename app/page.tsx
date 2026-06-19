"use client";

import {
  animate,
  stagger as animeStagger,
  createTimeline,
  utils,
} from "animejs";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { CalculatorSheet } from "./components/CalculatorSheet";
import { Reveal } from "./components/Reveal";
import {
  DATES,
  FORMATS,
  formatEuro,
  MODULE_D,
  MODULES_BCD,
  TEAMS,
  TOTAL_PEOPLE,
} from "./lib/propale";

const cn = (...c: (string | false | undefined | null)[]) =>
  c.filter(Boolean).join(" ");

function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-hero]"));
    utils.set(words, { opacity: 0, translateY: 60 });

    const tl = createTimeline({
      defaults: { ease: "outExpo", duration: 900 },
    });
    tl.add(words, {
      opacity: [0, 1],
      translateY: [60, 0],
      delay: animeStagger(120, { start: 200 }),
    });

    const scrollCue = el.querySelector<HTMLElement>("[data-cue]");
    if (scrollCue) {
      utils.set(scrollCue, { opacity: 0, translateY: -10 });
      tl.add(scrollCue, { opacity: [0, 1], translateY: [-10, 0] }, "-=400");
      // loop bounce
      animate(scrollCue, {
        translateY: [0, 10, 0],
        duration: 1600,
        loop: true,
        ease: "inOutSine",
        delay: 1200,
      });
    }
  }, []);

  return (
    <section className="relative overflow-hidden border-b-4 border-brutal-fg">
      <div className="relative px-6 md:px-10 lg:px-16 pt-16 md:pt-24 lg:pt-28 pb-20 md:pb-28">
        <div ref={ref} className="max-w-6xl">
          <div
            data-hero
            className="font-mono text-xs uppercase tracking-[4px] text-brutal-subtle mb-6"
          >
            The Tech Nation × BSport · {DATES.map((d) => d.label).join(" / ")}
          </div>
          <h1
            data-hero
            className="font-sans font-black uppercase tracking-tighter text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.82]"
          >
            Proposal
            <br />
            <span className="text-outline">Training</span>{" "}
            <span className="text-brutal-secondary">Claude</span>
          </h1>
          <p
            data-hero
            className="mt-8 font-mono text-lg md:text-xl lg:text-2xl max-w-3xl text-brutal-soft leading-relaxed"
          >
            In-person sessions, à la carte. Pick your modules, formats, and
            teams. The price updates automatically.
          </p>
          <div data-hero className="mt-10 flex flex-wrap gap-3">
            {[
              "Claude Code",
              "Augmented Sales",
              "Personal Assistant",
              "Inspiration",
              "Chat & Cowork",
              "Hackathon",
            ].map((t) => (
              <span
                key={t}
                className="border-2 border-brutal-fg px-3 py-1.5 font-mono text-xs uppercase tracking-wider"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <a
          data-cue
          href="#calc"
          className="mt-16 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[3px] text-brutal-subtle hover:text-brutal-secondary transition-colors"
        >
          Build the proposal
          <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Pick your modules",
      d: "Claude Code, Inspiration, Chat & Cowork, Hackathon facilitators. Take what you need.",
    },
    {
      n: "02",
      t: "Pick format + teams",
      d: `Masterclass up to ${FORMATS.masterclass.capacity} people, or workshop up to ${FORMATS.workshop.capacity}. Check the teams you want.`,
    },
    {
      n: "03",
      t: "Price updates live",
      d: "The total updates automatically, excl. tax. Pick dates at the end.",
    },
  ];
  return (
    <Reveal childSelector="[data-step]" className="border-b-4 border-brutal-fg">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 border-4 border-brutal-fg">
          {steps.map((s, i) => (
            <div
              data-step
              key={s.n}
              className={cn(
                "p-6 md:p-8 border-brutal-fg",
                i < steps.length - 1 &&
                  "border-b-4 md:border-b-0 md:border-r-4",
              )}
            >
              <div className="font-sans font-black text-5xl md:text-6xl text-brutal-secondary leading-none">
                {s.n}
              </div>
              <h3 className="mt-4 font-sans font-black uppercase tracking-tight text-xl md:text-2xl">
                {s.t}
              </h3>
              <p className="mt-3 font-mono text-sm text-brutal-soft leading-relaxed">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function Formats() {
  const cards = [
    {
      key: "masterclass" as const,
      ...FORMATS.masterclass,
      points: [
        "We present, install, and demo",
        "Limited interactivity at this scale",
        "Ideal for rolling out Claude Code to a large group in 1h",
      ],
    },
    {
      key: "workshop" as const,
      ...FORMATS.workshop,
      points: [
        "Hands-on support and Q&A",
        "4 trainers on site",
        "Beyond 25 people, the group is split into multiple sessions",
      ],
    },
  ];
  return (
    <Reveal childSelector="[data-fmt]" className="border-b-4 border-brutal-fg">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-3">
          The two formats
        </h2>
        <p className="font-mono text-base md:text-lg text-brutal-soft max-w-2xl mb-10">
          In person at BSport. No remote option.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c) => {
            const isDark = c.key === "workshop";
            return (
            <div
              data-fmt
              key={c.key}
              className={cn(
                "border-4 border-brutal-fg shadow-hard-lg p-8 flex flex-col",
                isDark && "bg-brutal-fg text-brutal-bg",
              )}
            >
              <div className="flex items-baseline justify-between gap-4 border-b-4 border-current pb-4 mb-6">
                <h3 className="font-sans font-black uppercase tracking-tighter text-3xl md:text-4xl">
                  {c.label}
                </h3>
                <span className="font-sans font-black text-2xl md:text-3xl text-brutal-secondary">
                  {formatEuro(c.price)}€
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-wider",
                      isDark ? "text-brutal-on-dark-muted" : "text-brutal-subtle",
                    )}
                  >
                    Capacity
                  </div>
                  <div className="font-sans font-black text-2xl md:text-3xl">
                    {c.capacity}
                  </div>
                </div>
                <div>
                  <div
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-wider",
                      isDark ? "text-brutal-on-dark-muted" : "text-brutal-subtle",
                    )}
                  >
                    Duration
                  </div>
                  <div className="font-sans font-black text-2xl md:text-3xl">
                    {c.duration}
                  </div>
                </div>
                <div>
                  <div
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-wider",
                      isDark ? "text-brutal-on-dark-muted" : "text-brutal-subtle",
                    )}
                  >
                    Trainers
                  </div>
                  <div className="font-sans font-black text-2xl md:text-3xl">
                    {c.trainers}
                  </div>
                </div>
              </div>
              <ul className="font-mono text-sm space-y-2 flex-1">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-brutal-accent">▸</span>
                    <span
                      className={isDark ? "text-brutal-on-dark-subtle" : "text-brutal-soft"}
                    >
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
              <div
                className={cn(
                  "mt-6 font-mono text-xs uppercase tracking-wider",
                  isDark ? "text-brutal-on-dark-muted" : "text-brutal-subtle",
                )}
              >
                {formatEuro(c.price)}€ excl. tax / session
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </Reveal>
  );
}

function ModulesOverview() {
  const all = [
    {
      id: "A",
      title: "Claude Code",
      tagline:
        "Personal assistant: connect your tools (email, etc.), build a second brain, automate the sales process. Not a tool for shipping hosted apps.",
      sub: "Option 1 · Masterclass 1h / Options 2 & 3 · Workshops 1h30",
    },
    ...MODULES_BCD.map((m) => ({
      id: m.id,
      title: m.name,
      tagline: m.tagline,
      sub: m.cover,
    })),
    {
      id: "D",
      title: MODULE_D.name,
      tagline: MODULE_D.tagline,
      sub: `${formatEuro(MODULE_D.pricePerHourPerTrainer)}€ excl. tax / hour / trainer`,
    },
  ];
  return (
    <Reveal
      childSelector="[data-mod]"
      className="border-b-4 border-brutal-fg bg-brutal-muted"
    >
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-3">
          The modules
        </h2>
        <p className="font-mono text-base md:text-lg text-brutal-soft max-w-2xl mb-10">
          Four modules. Find them in the calculator below.
        </p>
        <div className="flex flex-col">
          {all.map((m) => (
            <div
              data-mod
              key={m.id}
              className="grid grid-cols-1 md:grid-cols-[auto_1fr_2fr] gap-4 md:gap-8 py-6 border-t-4 border-brutal-fg last:border-b-4"
            >
              <div className="font-sans font-black text-5xl md:text-6xl text-brutal-secondary leading-none">
                {m.id}
              </div>
              <h3 className="font-sans font-black uppercase tracking-tighter text-2xl md:text-3xl leading-tight">
                {m.title}
              </h3>
              <div>
                <p className="font-mono text-sm md:text-base text-brutal-soft leading-relaxed">
                  {m.tagline}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-brutal-faint">
                  {m.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function TeamsSection() {
  return (
    <Reveal childSelector="[data-row]" className="border-b-4 border-brutal-fg">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-3">
          The teams
        </h2>
        <p className="font-mono text-base md:text-lg text-brutal-soft max-w-2xl mb-10">
          {TOTAL_PEOPLE} people total. In workshops, groups over 25 are split
          into multiple sessions.
        </p>
        <div className="border-4 border-brutal-fg">
          {TEAMS.map((t, i) => (
            <div
              data-row
              key={t.id}
              className={cn(
                "flex items-center gap-6 p-5 md:p-6",
                i < TEAMS.length - 1 && "border-b-4 border-brutal-fg",
              )}
            >
              <div className="font-sans font-black uppercase tracking-tight text-2xl md:text-3xl">
                {t.label}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-brutal-subtle hidden sm:block">
                {t.note}
              </div>
              <div className="ml-auto font-sans font-black text-3xl md:text-4xl text-brutal-secondary">
                {t.count} people
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function WhoIntervenes() {
  return (
    <Reveal className="border-b-4 border-brutal-fg bg-brutal-fg text-brutal-bg">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-10 text-brutal-bg">
          Who's leading
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              t: "Masterclasses",
              d: "Led by Jérémie (CEO) and Manar (CTO).",
            },
            {
              t: "Workshops",
              d: "Led by Jérémie, Manar + 2 members of The Tech Nation team.",
            },
            {
              t: "Hackathon facilitators",
              d: "Jérémie (CEO), Manar (CTO), and other The Tech Nation members depending on the topic.",
            },
          ].map((b) => (
            <div
              key={b.t}
              className="border-4 border-brutal-bg p-6 bg-brutal-fg"
            >
              <h3 className="font-sans font-black uppercase tracking-tight text-xl md:text-2xl text-brutal-accent">
                {b.t}
              </h3>
              <p className="mt-3 font-mono text-sm text-brutal-on-dark-subtle leading-relaxed">
                {b.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col flex-1 bg-brutal-bg text-brutal-fg">
      <Hero />
      <HowItWorks />
      <Formats />
      <ModulesOverview />
      <TeamsSection />
      <WhoIntervenes />

      <section id="calc" className="border-b-4 border-brutal-fg scroll-mt-0">
        <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
          <Reveal childSelector="[data-calchead]">
            <div className="mb-10">
              <h2
                data-calchead
                className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-7xl mb-3"
              >
                The calculator
              </h2>
              <p
                data-calchead
                className="font-mono text-base md:text-lg text-brutal-soft max-w-3xl"
              >
                Check your modules, formats, and teams. The total updates
                automatically. Pick your dates at the end.
              </p>
            </div>
          </Reveal>
          <CalculatorSheet />
        </div>
      </section>
    </main>
  );
}
