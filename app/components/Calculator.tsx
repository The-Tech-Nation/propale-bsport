"use client";

import { animate, utils } from "animejs";
import { ArrowRight, Check, ChevronDown, Clock, Minus, Plus, Users, X } from "lucide-react";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildPropaleMailtoUrl,
  openPropaleEmail,
} from "../lib/propale-mailto";
import {
  computeQuote,
  type FormatKey,
  formatEuro,
  initialSelection,
  MODULE_A_OPTIONS,
  MODULE_D,
  MODULES_BCD,
  type ModuleAOption,
  type Selection,
  TEAMS,
  type TeamId,
} from "../lib/propale";
import {
  loadSelection,
  PROPALE_SELECTION_STORAGE_KEY,
} from "../lib/propale-selection";
import { AnimatedNumber } from "./AnimatedNumber";

const cn = (...c: (string | false | undefined | null)[]) =>
  c.filter(Boolean).join(" ");

function TeamGrid({
  selected,
  onToggle,
}: {
  selected: TeamId[];
  onToggle: (id: TeamId) => void;
}) {
  const row1 = TEAMS.slice(0, 2);
  const row2 = TEAMS.slice(2);

  const renderTeam = (t: (typeof TEAMS)[number], isLastInRow: boolean) => {
    const on = selected.includes(t.id);
    return (
      <button
        type="button"
        key={t.id}
        onClick={() => onToggle(t.id)}
        className={cn(
          "group relative p-4 text-left border-r-4 border-brutal-fg transition-colors",
          isLastInRow && "border-r-0",
          on
            ? "bg-brutal-fg text-brutal-bg"
            : "bg-brutal-bg hover:bg-brutal-muted",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-sans font-black uppercase tracking-tight text-base leading-none">
            {t.label}
          </span>
          <span
            className={cn(
              "flex size-5 items-center justify-center border-2 border-current shrink-0",
              on ? "bg-brutal-accent text-brutal-fg" : "bg-brutal-bg",
            )}
          >
            {on && <Check size={14} strokeWidth={3} />}
          </span>
        </div>
        <div className="mt-2 font-mono text-xs opacity-80">{t.count} pers.</div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-wider opacity-60">
          {t.note}
        </div>
      </button>
    );
  };

  return (
    <div className="border-t-4 border-l-4 border-brutal-fg">
      <div className="grid grid-cols-2 border-b-4 border-r-4 border-brutal-fg">
        {row1.map((t, i) => renderTeam(t, i === row1.length - 1))}
      </div>
      <div className="grid grid-cols-3 border-r-4 border-b-4 border-brutal-fg">
        {row2.map((t, i) => renderTeam(t, i === row2.length - 1))}
      </div>
    </div>
  );
}

function FormatToggle({
  value,
  onChange,
}: {
  value: FormatKey;
  onChange: (f: FormatKey) => void;
}) {
  return (
    <div className="inline-flex border-t-4 border-l-4 border-brutal-fg">
      {(["masterclass", "workshop"] as FormatKey[]).map((f) => (
        <button
          type="button"
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            "px-4 py-2 font-sans font-black uppercase tracking-tight text-sm border-r-4 border-b-4 border-brutal-fg transition-colors",
            value === f
              ? "bg-brutal-fg text-brutal-bg"
              : "bg-brutal-bg hover:bg-brutal-muted",
          )}
        >
          {f === "masterclass" ? "Masterclass" : "Workshop"}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="inline-flex items-stretch border-4 border-brutal-fg">
      <button
        type="button"
        onClick={() => set(value - step)}
        className="px-3 py-2 bg-brutal-bg hover:bg-brutal-muted border-r-4 border-brutal-fg"
        aria-label="moins"
      >
        <Minus size={16} />
      </button>
      <div className="min-w-16 px-4 py-2 flex items-center justify-center font-sans font-black text-xl bg-brutal-fg text-brutal-bg">
        {value}
      </div>
      <button
        type="button"
        onClick={() => set(value + step)}
        className="px-3 py-2 bg-brutal-bg hover:bg-brutal-muted border-l-4 border-brutal-fg"
        aria-label="plus"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function CardHeader({
  index,
  title,
  tagline,
}: {
  index: string;
  title: string;
  tagline?: string;
}) {
  return (
    <div className="border-b-4 border-brutal-fg p-6 bg-brutal-accent">
      <div className="flex items-center gap-3">
        <span className="bg-brutal-fg text-brutal-accent font-mono text-xs uppercase tracking-[3px] px-2.5 py-1">
          {index}
        </span>
        <h3 className="font-sans font-black uppercase tracking-tighter text-2xl md:text-3xl leading-none">
          {title}
        </h3>
      </div>
      {tagline && (
        <p className="mt-3 font-mono text-sm text-brutal-fg/80">{tagline}</p>
      )}
    </div>
  );
}

function MiniSummary({ lines }: { lines: { label: string; total: number }[] }) {
  if (lines.length === 0) return null;
  const total = lines.reduce((s, l) => s + l.total, 0);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
      {lines.map((l) => (
        <span key={`${l.label}-${l.total}`} className="text-brutal-fg/70">
          {l.label} ·{" "}
          <span className="text-brutal-fg font-sans font-black">
            {formatEuro(l.total)}€
          </span>
        </span>
      ))}
      <span className="ml-auto font-sans font-black uppercase tracking-tight">
        = {formatEuro(total)}€ HT
      </span>
    </div>
  );
}

export function Calculator() {
  const [sel, setSel] = useState<Selection>(initialSelection);
  const [hydrated, setHydrated] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  useEffect(() => {
    setSel(loadSelection());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PROPALE_SELECTION_STORAGE_KEY, JSON.stringify(sel));
    } catch {
      /* ignore quota / privacy errors */
    }
  }, [sel, hydrated]);

  const quote = useMemo(() => computeQuote(sel), [sel]);

  const summaryRailRef = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const rail = summaryRailRef.current;
    const panel = summaryPanelRef.current;
    if (!rail || !panel) return;

    const desktopMq = window.matchMedia("(min-width: 1473px)");

    const syncPanelInRail = () => {
      const desktop = desktopMq.matches;
      if (!desktop) {
        panel.style.top = "";
        panel.style.willChange = "";
        return;
      }

      const railRect = rail.getBoundingClientRect();
      const panelHeight = panel.offsetHeight;
      const viewportCenter = window.innerHeight / 2 - panelHeight / 2;
      const maxOffset = Math.max(0, rail.offsetHeight - panelHeight);
      const offsetY = Math.min(
        maxOffset,
        Math.max(0, viewportCenter - railRect.top),
      );

      panel.style.willChange = "top";
      panel.style.top = `${offsetY}px`;
    };

    let ticking = false;
    const onScroll = () => {
      if (!desktopMq.matches) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        syncPanelInRail();
        ticking = false;
      });
    };

    syncPanelInRail();
    const ro = new ResizeObserver(syncPanelInRail);
    ro.observe(rail);
    ro.observe(panel);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncPanelInRail);
    desktopMq.addEventListener("change", syncPanelInRail);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncPanelInRail);
      desktopMq.removeEventListener("change", syncPanelInRail);
      panel.style.top = "";
      panel.style.willChange = "";
    };
  }, [quote.lines.length, quote.total, sel.dates.length]);

  const toggleTeamIn = (key: keyof Selection | "A" | "B" | "C", id: TeamId) => {
    setSel((prev) => {
      if (key === "A") {
        const has = prev.moduleA.teams.includes(id);
        return {
          ...prev,
          moduleA: {
            ...prev.moduleA,
            teams: has
              ? prev.moduleA.teams.filter((t) => t !== id)
              : [...prev.moduleA.teams, id],
          },
        };
      }
      const m = prev.modulesBC[key];
      if (!m) return prev;
      const has = m.teams.includes(id);
      return {
        ...prev,
        modulesBC: {
          ...prev.modulesBC,
          [key]: {
            ...m,
            teams: has ? m.teams.filter((t) => t !== id) : [...m.teams, id],
          },
        },
      };
    });
  };

  const setModuleAOption = (option: ModuleAOption) => {
    setSel((prev) => ({
      ...prev,
      moduleA: {
        ...prev.moduleA,
        option: prev.moduleA.option === option ? null : option,
      },
    }));
  };

  const setBC = (
    id: string,
    patch: Partial<{ enabled: boolean; format: FormatKey }>,
  ) => {
    setSel((prev) => ({
      ...prev,
      modulesBC: {
        ...prev.modulesBC,
        [id]: { ...prev.modulesBC[id], ...patch },
      },
    }));
  };

  const setD = (patch: Partial<Selection["moduleD"]>) => {
    setSel((prev) => ({ ...prev, moduleD: { ...prev.moduleD, ...patch } }));
  };

  const toggleDate = (id: string) => {
    setSel((prev) => ({
      ...prev,
      dates: prev.dates.includes(id)
        ? prev.dates.filter((d) => d !== id)
        : [...prev.dates, id],
    }));
  };

  const reset = () => {
    setSel(initialSelection);
    try {
      localStorage.removeItem(PROPALE_SELECTION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // anime.js: animate breakdown lines whenever they change
  const breakdownRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    const items = Array.from(node.querySelectorAll<HTMLElement>("[data-line]"));
    if (items.length === 0) return;
    utils.set(items, { opacity: 0, translateX: -12 });
    animate(items, {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 500,
      delay: (_t: unknown, i: number) => i * 60,
      ease: "outExpo",
    });
  };

  const moduleAQuote = useMemo(() => {
    if (!sel.moduleA.option || sel.moduleA.teams.length === 0) return [];
    const q = computeQuote({
      ...sel,
      modulesBC: { ...sel.modulesBC },
      moduleD: { ...sel.moduleD, enabled: false },
    });
    return q.lines.filter((l) => l.label.startsWith("Claude Code"));
  }, [sel]);

  const moduleBCQuote = (id: string) => {
    const q = computeQuote(sel);
    return q.lines.filter((l) => l.label.startsWith(`Module ${id}`));
  };

  const moduleDQuote = useMemo(() => {
    const q = computeQuote(sel);
    return q.lines.filter((l) => l.label.includes("hackathon"));
  }, [sel]);

  return (
    <div className="grid grid-cols-1 desktop:grid-cols-[5fr_7fr] desktop:items-stretch gap-0 border-4 border-brutal-fg shadow-hard-xl">
      {/* SUMMARY — sticky */}
      <aside className="sticky top-0 desktop:top-8 z-30 self-start desktop:self-stretch desktop:flex desktop:flex-col w-full bg-brutal-fg text-brutal-bg border-b-4 desktop:border-b-0 desktop:border-r-4 border-brutal-fg overflow-hidden">
        <div
          ref={summaryRailRef}
          className={cn(
            "flex flex-col scrollbar-secondary desktop:relative desktop:flex-1 desktop:min-h-0 desktop:max-h-none! desktop:overflow-hidden",
            mobileSummaryOpen
              ? "max-h-[85vh] overflow-y-auto"
              : "overflow-hidden",
          )}
        >
          <div
            ref={summaryPanelRef}
            className="flex flex-col desktop:absolute desktop:inset-x-0 desktop:max-h-[calc(100vh-4rem)] desktop:overflow-y-auto desktop:scrollbar-secondary"
          >
            <button
              type="button"
              onClick={() => setMobileSummaryOpen((open) => !open)}
              aria-expanded={mobileSummaryOpen}
              className={cn(
                "desktop:hidden w-full flex items-center gap-4 p-4 text-left transition-colors",
                mobileSummaryOpen && "border-b-4 border-brutal-bg/20",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[3px] text-brutal-accent">
                  Coût total
                </div>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans font-black uppercase tracking-tighter text-4xl leading-none text-brutal-bg">
                    <AnimatedNumber value={quote.total} />
                  </span>
                  <span className="font-sans font-black uppercase text-lg text-brutal-secondary">
                    €&nbsp;HT
                  </span>
                </div>
              </div>
              <ChevronDown
                size={22}
                className={cn(
                  "shrink-0 text-brutal-accent transition-transform duration-200",
                  mobileSummaryOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] desktop:contents",
                mobileSummaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div
                className={cn(
                  "min-h-0 overflow-hidden transition-[opacity,transform] duration-400 ease-out desktop:overflow-visible",
                  mobileSummaryOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 desktop:opacity-100 desktop:translate-y-0",
                )}
              >
                <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10">
          <div className="hidden desktop:block">
            <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-accent">
              Coût total
            </div>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="font-sans font-black uppercase tracking-tighter text-6xl md:text-7xl lg:text-8xl leading-[0.85] text-brutal-bg">
                <AnimatedNumber value={quote.total} />
              </span>
              <span className="font-sans font-black uppercase text-2xl md:text-3xl text-brutal-secondary">
                €&nbsp;HT
              </span>
            </div>
          </div>

          <div className="h-1.5 bg-brutal-accent w-full" />

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-brutal-accent" />
              <span className="font-mono text-sm">
                <span className="font-sans font-black text-lg">
                  {quote.peopleCovered}
                </span>{" "}
                pers. couvertes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-brutal-accent" />
              <span className="font-mono text-sm">
                <span className="font-sans font-black text-lg">
                  {quote.sessionsCount}
                </span>{" "}
                sessions
              </span>
            </div>
          </div>

          <div ref={breakdownRef} className="flex flex-col">
            {quote.lines.length === 0 && (
              <p className="font-mono text-sm text-brutal-bg/60">
                Cochez les modules et les équipes ci-contre. Le total se met à
                jour.
              </p>
            )}
            {quote.lines.map((l) => (
              <div
                data-line
                key={`${l.label}-${l.detail}`}
                className="py-3 border-t-2 border-brutal-bg/30 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-sans font-black uppercase tracking-tight text-sm leading-tight">
                    {l.label}
                  </div>
                  <div className="font-mono text-xs text-brutal-bg/60 mt-0.5">
                    {l.detail}
                  </div>
                </div>
                <div className="font-sans font-black text-lg whitespace-nowrap">
                  {formatEuro(l.total)}€
                </div>
              </div>
            ))}
          </div>

          {sel.dates.length > 0 && (
            <div className="pt-2">
              <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-bg/60">
                Dates retenues
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sel.dates.map((d) => (
                  <span
                    key={d}
                    className="bg-brutal-bg text-brutal-fg font-sans font-black uppercase text-xs px-2.5 py-1"
                  >
                    {d === "2026-06-29"
                      ? "29 juin"
                      : d === "2026-06-30"
                        ? "30 juin"
                        : "3 juillet"}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="font-mono text-xs text-brutal-bg/50 mt-auto pt-4 border-t-2 border-brutal-bg/30">
            Prix indicatifs, hors taxes. En présentiel chez BSport.
          </p>

          <CTAButton
            variant="aside"
            href={buildPropaleMailtoUrl(sel)}
            onSend={() => {
              window.location.href = buildPropaleMailtoUrl(sel);
            }}
          >
            Envoyer la propale
          </CTAButton>

          <button
            type="button"
            onClick={reset}
            className="self-start inline-flex items-center gap-2 border-2 border-brutal-bg/40 px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:border-brutal-secondary hover:text-brutal-secondary transition-colors"
          >
            <X size={14} /> Réinitialiser
          </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* BUILDER */}
      <div className="flex flex-col">
        {/* MODULE A */}
        <section className="border-b-4 border-brutal-fg">
          <CardHeader
            index="Module A"
            title="Claude Code"
            tagline="Claude Code n'est pas un outil pour builder des apps à héberger. C'est un personal assistant : on branche les outils du quotidien (mail, etc.), on crée un second brain, on automatise des process — notamment le process de vente."
          />
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60 mb-3">
                Choisissez une option
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t-4 border-l-4 border-brutal-fg">
                {MODULE_A_OPTIONS.map((opt) => {
                  const on = sel.moduleA.option === opt.key;
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => setModuleAOption(opt.key)}
                      className={cn(
                        "relative p-5 text-left border-r-4 border-b-4 border-brutal-fg transition-colors",
                        on
                          ? "bg-brutal-fg text-brutal-bg"
                          : "bg-brutal-bg hover:bg-brutal-muted",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-xs uppercase tracking-wider opacity-70">
                          Option {opt.key}
                        </span>
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center border-2 border-current shrink-0",
                            on
                              ? "bg-brutal-accent text-brutal-fg"
                              : "bg-brutal-bg",
                          )}
                        >
                          {on && <Check size={14} strokeWidth={3} />}
                        </span>
                      </div>
                      <div className="mt-2 font-sans font-black uppercase tracking-tight text-lg leading-tight">
                        {opt.title}
                      </div>
                      <div className="mt-1 font-mono text-xs opacity-70">
                        {opt.duration} ·{" "}
                        {opt.format === "masterclass"
                          ? "Masterclass"
                          : "Workshop"}{" "}
                        · pour {opt.audience}
                      </div>
                      <div className="mt-2 font-mono text-xs opacity-80">
                        {opt.cover}
                      </div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setModuleAOption("2+3")}
                  className={cn(
                    "relative p-5 text-left border-r-4 border-b-4 border-brutal-fg transition-colors",
                    sel.moduleA.option === "2+3"
                      ? "bg-brutal-fg text-brutal-bg"
                      : "bg-brutal-bg hover:bg-brutal-muted",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs uppercase tracking-wider opacity-70">
                      Option 2 + 3
                    </span>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center border-2 border-current shrink-0",
                        sel.moduleA.option === "2+3"
                          ? "bg-brutal-accent text-brutal-fg"
                          : "bg-brutal-bg",
                      )}
                    >
                      {sel.moduleA.option === "2+3" && (
                        <Check size={14} strokeWidth={3} />
                      )}
                    </span>
                  </div>
                  <div className="mt-2 font-sans font-black uppercase tracking-tight text-lg leading-tight">
                    Augmented Sales + Personal Assistant
                  </div>
                  <div className="mt-1 font-mono text-xs opacity-70">
                    2 workshops 1h30 · pour sales + tout le monde
                  </div>
                  <div className="mt-2 font-mono text-xs opacity-80">
                    Les deux workshops en complément : vente augmentée +
                    assistant personnel.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60 mb-3">
                Équipes concernées
              </div>
              {!sel.moduleA.option && (
                <p className="font-mono text-xs text-brutal-fg/50 mb-3">
                  Choisissez d'abord une option.
                </p>
              )}
              <TeamGrid
                selected={sel.moduleA.teams}
                onToggle={(id) => toggleTeamIn("A", id)}
              />
            </div>

            <MiniSummary lines={moduleAQuote} />
          </div>
        </section>

        {/* MODULES B & C */}
        {MODULES_BCD.map((m) => {
          const pick = sel.modulesBC[m.id];
          return (
            <section key={m.id} className="border-b-4 border-brutal-fg">
              <CardHeader
                index={`Module ${m.id}`}
                title={m.name}
                tagline={m.tagline}
              />
              <div className="p-6 md:p-8 flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setBC(m.id, { enabled: !pick.enabled })}
                    className={cn(
                      "inline-flex items-center gap-2 border-4 border-brutal-fg px-4 py-2 font-sans font-black uppercase tracking-tight text-sm transition-colors",
                      pick.enabled
                        ? "bg-brutal-fg text-brutal-bg"
                        : "bg-brutal-bg hover:bg-brutal-muted",
                    )}
                  >
                    {pick.enabled ? (
                      <>
                        <Check size={16} strokeWidth={3} /> Inclure
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Inclure ce module
                      </>
                    )}
                  </button>
                  <FormatToggle
                    value={pick.format}
                    onChange={(f) => setBC(m.id, { format: f, enabled: true })}
                  />
                </div>

                <p className="font-mono text-sm text-brutal-fg/80">
                  {pick.format === "masterclass"
                    ? m.masterclassDesc
                    : m.workshopDesc}
                </p>

                {pick.enabled && (
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60 mb-3">
                      Équipes concernées
                    </div>
                    <TeamGrid
                      selected={pick.teams}
                      onToggle={(id) => toggleTeamIn(m.id, id)}
                    />
                  </div>
                )}

                <MiniSummary lines={moduleBCQuote(m.id)} />
              </div>
            </section>
          );
        })}

        {/* MODULE D */}
        <section className="border-b-4 border-brutal-fg">
          <CardHeader
            index="Module D"
            title={MODULE_D.name}
            tagline={MODULE_D.tagline}
          />
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setD({ enabled: !sel.moduleD.enabled })}
              className={cn(
                "self-start inline-flex items-center gap-2 border-4 border-brutal-fg px-4 py-2 font-sans font-black uppercase tracking-tight text-sm transition-colors",
                sel.moduleD.enabled
                  ? "bg-brutal-fg text-brutal-bg"
                  : "bg-brutal-bg hover:bg-brutal-muted",
              )}
            >
              {sel.moduleD.enabled ? (
                <>
                  <Check size={16} strokeWidth={3} /> Inclure
                </>
              ) : (
                <>
                  <Plus size={16} /> Inclure ce module
                </>
              )}
            </button>

            {sel.moduleD.enabled && (
              <div className="flex flex-wrap items-end gap-8">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60">
                    Heures
                  </span>
                  <Stepper
                    value={sel.moduleD.hours}
                    onChange={(v) => setD({ hours: v })}
                    min={0}
                    max={48}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60">
                    Formateurs
                  </span>
                  <Stepper
                    value={sel.moduleD.trainers}
                    onChange={(v) => setD({ trainers: v })}
                    min={1}
                    max={6}
                  />
                </div>
                <div className="font-mono text-sm text-brutal-fg/70">
                  300€ HT / heure / formateur
                </div>
              </div>
            )}

            <MiniSummary lines={moduleDQuote} />
          </div>
        </section>

        {/* DATES */}
        <section className="p-6 md:p-8 flex flex-col gap-5">
          <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-fg/60">
            Dates souhaitées
          </div>
          <div className="flex flex-wrap gap-0 border-t-4 border-l-4 border-brutal-fg">
            {[
              { id: "2026-06-29", label: "29 juin" },
              { id: "2026-06-30", label: "30 juin" },
              { id: "2026-07-03", label: "3 juillet" },
            ].map((d) => {
              const on = sel.dates.includes(d.id);
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => toggleDate(d.id)}
                  className={cn(
                    "flex-1 min-w-32 p-4 flex items-center justify-between gap-3 border-r-4 border-b-4 border-brutal-fg transition-colors",
                    on
                      ? "bg-brutal-fg text-brutal-bg"
                      : "bg-brutal-bg hover:bg-brutal-muted",
                  )}
                >
                  <span className="font-sans font-black uppercase tracking-tight text-lg">
                    {d.label}
                  </span>
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center border-2 border-current",
                      on ? "bg-brutal-accent text-brutal-fg" : "bg-brutal-bg",
                    )}
                  >
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="font-mono text-xs text-brutal-fg/50">
            Indiquez vos créneaux. On confirmera l'agenda ensemble.
          </p>
        </section>
      </div>
    </div>
  );
}

export function CTAButton({
  children,
  variant = "default",
  href,
  onSend,
}: {
  children: ReactNode;
  variant?: "default" | "aside";
  href?: string;
  onSend?: () => void;
}) {
  const mailtoHref = href ?? buildPropaleMailtoUrl(initialSelection);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onSend) {
      onSend();
      return;
    }
    openPropaleEmail();
  };

  return (
    <a
      href={mailtoHref}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-3 font-sans font-black uppercase tracking-wider transition-all duration-200",
        variant === "aside"
          ? "w-full bg-brutal-accent text-brutal-fg border-4 border-brutal-accent px-6 py-5 text-base md:text-lg shadow-[4px_4px_0px_0px_#ff00ff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#ff00ff]"
          : "bg-brutal-fg text-brutal-secondary border-4 border-brutal-secondary px-8 py-4 text-lg shadow-[4px_4px_0px_0px_#ff00ff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#ff00ff]",
      )}
    >
      {children}
      <ArrowRight size={variant === "aside" ? 22 : 20} />
    </a>
  );
}
