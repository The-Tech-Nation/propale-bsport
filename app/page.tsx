"use client";

import {
  animate,
  stagger as animeStagger,
  createTimeline,
  utils,
} from "animejs";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { Calculator, CTAButton } from "./components/Calculator";
import { PROPALE_CONTACT_EMAIL } from "./lib/propale-mailto";
import { Reveal } from "./components/Reveal";
import {
  FORMATS,
  MODULE_A_OPTIONS,
  MODULE_D,
  MODULES_BCD,
  TEAMS,
  TOTAL_PEOPLE,
} from "./lib/propale";

const cn = (...c: (string | false | undefined | null)[]) =>
  c.filter(Boolean).join(" ");

function Marquee() {
  const items = [
    "PRÉSENTIEL",
    "À LA CARTE",
    "VOUS COCHEZ",
    "LE PRIX SE CALCULE",
    "CLAUDE CODE",
    "SALES AUGMENTED",
    "PERSONAL ASSISTANT",
    "INSPIRATION",
    "CHAT & COWORK",
    "HACKATHON",
  ];
  const row = [...items, ...items].map((text, i) => ({
    text,
    id: `${text}-${i}`,
  }));
  return (
    <div className="border-y-4 border-brutal-fg bg-brutal-fg text-brutal-bg overflow-hidden">
      <div
        className="flex whitespace-nowrap py-3"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {row.map((item) => (
          <span
            key={item.id}
            className="font-sans font-black uppercase tracking-tight text-xl px-6 flex items-center gap-6"
          >
            {item.text}
            <span className="text-brutal-accent">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

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

    const grid = el.querySelector<HTMLElement>("[data-grid]");
    if (grid) {
      utils.set(grid, { opacity: 0 });
      tl.add(grid, { opacity: [0, 1], duration: 1200 }, "-=600");
    }

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
      <div
        data-grid
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brutal-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-brutal-fg) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.06,
          animation: "gridPulse 6s ease-in-out infinite",
        }}
      />
      <div className="relative px-6 md:px-10 lg:px-16 pt-16 md:pt-24 lg:pt-28 pb-20 md:pb-28">
        <div ref={ref} className="max-w-6xl">
          <div
            data-hero
            className="font-mono text-xs uppercase tracking-[4px] text-brutal-fg/60 mb-6"
          >
            The Tech Nation × BSport · 29 juin / 30 juin / 3 juillet
          </div>
          <h1
            data-hero
            className="font-sans font-black uppercase tracking-tighter text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.82]"
          >
            Proposition
            <br />
            <span className="text-outline">Formation</span>{" "}
            <span className="text-brutal-secondary">Claude</span>
          </h1>
          <p
            data-hero
            className="mt-8 font-mono text-lg md:text-xl lg:text-2xl max-w-3xl text-brutal-fg/80 leading-relaxed"
          >
            Sessions en présentiel, à la carte. Vous cochez les modules, les
            formats et les équipes. Le prix se calcule tout seul.
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
          className="mt-16 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60 hover:text-brutal-secondary transition-colors"
        >
          Construire la propale
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
      t: "Choisir les modules",
      d: "Claude Code, Inspiration, Chat & Cowork, Intervenants hackathon. Vous prenez ce qui sert.",
    },
    {
      n: "02",
      t: "Choisir format + équipes",
      d: "Masterclass jusqu'à 100 personnes, ou workshop jusqu'à 25. Vous cochez les équipes.",
    },
    {
      n: "03",
      t: "Le prix se calcule",
      d: "Le total se met à jour automatiquement, HT. Dates à la fin.",
    },
  ];
  return (
    <Reveal childSelector="[data-step]" className="border-b-4 border-brutal-fg">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-10">
          Comment ça marche
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
              <p className="mt-3 font-mono text-sm text-brutal-fg/70 leading-relaxed">
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
        "On présente, on installe, on démontre",
        "Peu d'interactivité à cette échelle",
        "Idéal pour installer Claude Code sur un grand groupe en 1h",
      ],
    },
    {
      key: "workshop" as const,
      ...FORMATS.workshop,
      points: [
        "Assistance personnalisée, questions",
        "4 formateurs présents",
        "Au-delà de 25 personnes, le groupe est divisé en plusieurs sessions",
      ],
    },
  ];
  return (
    <Reveal childSelector="[data-fmt]" className="border-b-4 border-brutal-fg">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-3">
          Les deux formats
        </h2>
        <p className="font-mono text-base md:text-lg text-brutal-fg/70 max-w-2xl mb-10">
          En présentiel chez BSport. Pas d'option visio.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c) => (
            <div
              data-fmt
              key={c.key}
              className={cn(
                "border-4 border-brutal-fg shadow-hard-lg p-8 flex flex-col",
                c.key === "workshop" && "bg-brutal-fg text-brutal-bg",
              )}
            >
              <div className="flex items-baseline justify-between gap-4 border-b-4 border-current pb-4 mb-6">
                <h3 className="font-sans font-black uppercase tracking-tighter text-3xl md:text-4xl">
                  {c.label}
                </h3>
                <span className="font-sans font-black text-2xl md:text-3xl text-brutal-secondary">
                  {c.price}€
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider opacity-60">
                    Capacité
                  </div>
                  <div className="font-sans font-black text-2xl md:text-3xl">
                    {c.capacity}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider opacity-60">
                    Durée
                  </div>
                  <div className="font-sans font-black text-2xl md:text-3xl">
                    {c.duration}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider opacity-60">
                    Formateurs
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
                    <span className="opacity-90">{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 font-mono text-xs uppercase tracking-wider opacity-60">
                {c.price}€ HT / session
              </div>
            </div>
          ))}
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
        "Personal assistant : on branche les outils (mail, etc.), on crée un second brain, on automatise le process de vente. Pas un outil pour builder des apps à héberger.",
      sub: MODULE_A_OPTIONS.map((o) => `Option ${o.key} · ${o.title}`).join(
        " / ",
      ),
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
      sub: `${MODULE_D.pricePerHourPerTrainer}€ HT / heure / formateur`,
    },
  ];
  return (
    <Reveal
      childSelector="[data-mod]"
      className="border-b-4 border-brutal-fg bg-brutal-muted"
    >
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-3">
          Les modules
        </h2>
        <p className="font-mono text-base md:text-lg text-brutal-fg/70 max-w-2xl mb-10">
          Quatre modules. Vous les retrouvez dans la calculette plus bas.
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
                <p className="font-mono text-sm md:text-base text-brutal-fg/80 leading-relaxed">
                  {m.tagline}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-brutal-fg/50">
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
          Les équipes
        </h2>
        <p className="font-mono text-base md:text-lg text-brutal-fg/70 max-w-2xl mb-10">
          {TOTAL_PEOPLE} personnes au total. En workshop, les groupes de plus de
          25 sont divisés en plusieurs sessions.
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
              <div className="font-mono text-xs uppercase tracking-wider text-brutal-fg/60 hidden sm:block">
                {t.note}
              </div>
              <div className="ml-auto font-sans font-black text-3xl md:text-4xl text-brutal-secondary">
                {t.count}
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
          Qui intervient
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              t: "Masterclasses",
              d: "Animées par Jérémie (CEO) et Manar (CTO).",
            },
            {
              t: "Workshops",
              d: "Animés par Jérémie, Manar + 2 membres de l'équipe The Tech Nation.",
            },
            {
              t: "Intervenants hackathon",
              d: "Jérémie (CEO), Manar (CTO) et autres membres de The Tech Nation selon le sujet.",
            },
          ].map((b) => (
            <div
              key={b.t}
              className="border-4 border-brutal-bg p-6 bg-brutal-fg"
            >
              <h3 className="font-sans font-black uppercase tracking-tight text-xl md:text-2xl text-brutal-accent">
                {b.t}
              </h3>
              <p className="mt-3 font-mono text-sm text-brutal-bg/80 leading-relaxed">
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
      <Marquee />
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
                La calculette
              </h2>
              <p
                data-calchead
                className="font-mono text-base md:text-lg text-brutal-fg/70 max-w-3xl"
              >
                Cochez vos modules, formats et équipes. Le total se met à jour
                automatiquement. Sélectionnez vos dates à la fin.
              </p>
            </div>
          </Reveal>
          <Calculator />
        </div>
      </section>

      <section className="px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <Reveal childSelector="[data-cta]">
          <div className="max-w-4xl flex flex-col gap-8">
            <h2
              data-cta
              className="font-sans font-black uppercase tracking-tighter text-4xl md:text-6xl lg:text-7xl leading-[0.9]"
            >
              Cochez vos sélections
              <br />
              <span className="text-brutal-secondary">
                et envoyez-nous le document.
              </span>
            </h2>
            <p
              data-cta
              className="font-mono text-base md:text-lg text-brutal-fg/70 max-w-2xl"
            >
              On confirmera les dates et l'agenda ensemble.
            </p>
            <div data-cta>
              <CTAButton>Envoyer la propale</CTAButton>
            </div>
            <div
              data-cta
              className="mt-6 pt-8 border-t-4 border-brutal-fg flex flex-wrap items-center justify-between gap-4"
            >
              <span className="font-sans font-black uppercase tracking-tight text-2xl md:text-3xl">
                The Tech Nation
              </span>
              <a
                href={`mailto:${PROPALE_CONTACT_EMAIL}`}
                className="font-mono text-sm uppercase tracking-wider text-brutal-secondary hover:underline"
              >
                {PROPALE_CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
