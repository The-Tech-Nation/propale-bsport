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
  DATES,
  FORMATS,
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
        <div className="mt-2 font-mono text-xs text-brutal-soft">{t.count} people</div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-brutal-subtle">
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
        aria-label="decrease"
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
        aria-label="increase"
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
        <p className="mt-3 font-mono text-sm text-brutal-soft">{tagline}</p>
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
        <span key={`${l.label}-${l.total}`} className="text-brutal-soft">
          {l.label} ·{" "}
          <span className="text-brutal-fg font-sans font-black">
            {formatEuro(l.total)}€
          </span>
        </span>
      ))}
      <span className="ml-auto font-sans font-black uppercase tracking-tight">
        = {formatEuro(total)}€ excl. tax
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

  const toggleModuleBCTeam = (
    moduleId: "B" | "C",
    format: FormatKey,
    teamId: TeamId,
  ) => {
    setSel((prev) => {
      const pick = prev.modulesBC[moduleId];
      const otherFormat: FormatKey =
        format === "masterclass" ? "workshop" : "masterclass";
      const teams = pick.teamsByFormat[format] ?? [];
      const has = teams.includes(teamId);
      const teamsByFormat = { ...pick.teamsByFormat };

      if (has) {
        const next = teams.filter((t) => t !== teamId);
        if (next.length > 0) teamsByFormat[format] = next;
        else delete teamsByFormat[format];
      } else {
        teamsByFormat[format] = [...teams, teamId];
        const otherTeams = teamsByFormat[otherFormat] ?? [];
        if (otherTeams.includes(teamId)) {
          const next = otherTeams.filter((t) => t !== teamId);
          if (next.length > 0) teamsByFormat[otherFormat] = next;
          else delete teamsByFormat[otherFormat];
        }
      }

      return {
        ...prev,
        modulesBC: {
          ...prev.modulesBC,
          [moduleId]: { ...pick, enabled: true, teamsByFormat },
        },
      };
    });
  };

  const toggleModuleATeam = (option: ModuleAOption, id: TeamId) => {
    setSel((prev) => {
      const teams = prev.moduleA.teamsByOption[option] ?? [];
      const has = teams.includes(id);
      return {
        ...prev,
        moduleA: {
          ...prev.moduleA,
          teamsByOption: {
            ...prev.moduleA.teamsByOption,
            [option]: has
              ? teams.filter((t) => t !== id)
              : [...teams, id],
          },
        },
      };
    });
  };

  const toggleModuleAOption = (option: ModuleAOption) => {
    setSel((prev) => {
      const has = prev.moduleA.options.includes(option);
      if (has) {
        const { [option]: _removed, ...teamsByOption } =
          prev.moduleA.teamsByOption;
        return {
          ...prev,
          moduleA: {
            options: prev.moduleA.options.filter((o) => o !== option),
            teamsByOption,
          },
        };
      }
      return {
        ...prev,
        moduleA: {
          ...prev.moduleA,
          options: [...prev.moduleA.options, option],
        },
      };
    });
  };

  const setBCEnabled = (id: "B" | "C", enabled: boolean) => {
    setSel((prev) => ({
      ...prev,
      modulesBC: {
        ...prev.modulesBC,
        [id]: { ...prev.modulesBC[id], enabled },
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
                  Total cost
                </div>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans font-black uppercase tracking-tighter text-4xl leading-none text-brutal-bg">
                    <AnimatedNumber value={quote.total} />
                  </span>
                  <span className="font-sans font-black uppercase text-lg text-brutal-secondary">
                    €&nbsp;excl. tax
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
              Total cost
            </div>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="font-sans font-black uppercase tracking-tighter text-6xl md:text-7xl lg:text-8xl leading-[0.85] text-brutal-bg">
                <AnimatedNumber value={quote.total} />
              </span>
              <span className="font-sans font-black uppercase text-2xl md:text-3xl text-brutal-secondary">
                €&nbsp;excl. tax
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
                people covered
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
              <p className="font-mono text-sm text-brutal-on-dark-muted">
                Check modules and teams on the right. The total updates live.
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
                  <div className="font-mono text-xs text-brutal-on-dark-muted mt-0.5">
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
              <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-on-dark-muted">
                Selected dates
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sel.dates.map((d) => (
                  <span
                    key={d}
                    className="bg-brutal-bg text-brutal-fg font-sans font-black uppercase text-xs px-2.5 py-1"
                  >
                    {DATES.find((x) => x.id === d)?.label ?? d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="font-mono text-xs text-brutal-on-dark-muted mt-auto pt-4 border-t-2 border-brutal-bg/30">
            Indicative prices, excl. tax. In person at BSport.
          </p>

          <CTAButton
            variant="aside"
            href={buildPropaleMailtoUrl(sel)}
            onSend={() => {
              window.location.href = buildPropaleMailtoUrl(sel);
            }}
          >
            Send proposal
          </CTAButton>

          <button
            type="button"
            onClick={reset}
            className="self-start inline-flex items-center gap-2 border-2 border-brutal-bg/40 px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:border-brutal-secondary hover:text-brutal-secondary transition-colors"
          >
            <X size={14} /> Reset
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
            tagline="Claude Code isn't a tool for shipping hosted apps. It's a personal assistant: connect everyday tools (email, etc.), build a second brain, automate workflows — especially the sales process."
          />
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-subtle mb-2">
                Pick one or more options
              </div>
              <p className="font-mono text-xs text-brutal-soft mb-3 max-w-3xl">
                Option 1 is a{" "}
                <span className="font-sans font-black uppercase">masterclass</span>{" "}
                only (1h). Options 2 and 3 are{" "}
                <span className="font-sans font-black uppercase">workshops</span>{" "}
                only (1h30) — format doesn't change.
              </p>
              <div className="flex flex-row border-t-4 border-l-4 border-brutal-fg">
                {MODULE_A_OPTIONS.map((opt) => {
                  const on = sel.moduleA.options.includes(opt.key);
                  const isMasterclass = opt.format === "masterclass";
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => toggleModuleAOption(opt.key)}
                      className={cn(
                        "relative flex-1 min-w-0 p-5 text-left border-r-4 border-b-4 border-brutal-fg transition-colors",
                        on
                          ? "bg-brutal-fg text-brutal-bg"
                          : "bg-brutal-bg hover:bg-brutal-muted",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-xs uppercase tracking-wider text-brutal-subtle">
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
                      <span
                        className={cn(
                          "inline-block mt-2 px-2 py-0.5 font-sans font-black text-[10px] uppercase tracking-wider border-2",
                          on
                            ? isMasterclass
                              ? "border-brutal-accent bg-brutal-accent text-brutal-fg"
                              : "border-brutal-secondary bg-brutal-secondary text-brutal-fg"
                            : isMasterclass
                              ? "border-brutal-fg bg-brutal-fg text-brutal-bg"
                              : "border-brutal-secondary text-brutal-secondary",
                        )}
                      >
                        {isMasterclass
                          ? "Masterclass only"
                          : "Workshop only"}
                      </span>
                      <div className="mt-2 font-sans font-black uppercase tracking-tight text-lg leading-tight">
                        {opt.title}
                      </div>
                      <div className="mt-1 font-mono text-xs text-brutal-subtle">
                        {opt.duration} · for {opt.audience}
                      </div>
                      <div className="mt-2 font-mono text-xs text-brutal-soft">
                        {opt.cover}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {sel.moduleA.options.length === 0 && (
                <p className="font-mono text-xs text-brutal-faint">
                  Pick at least one option first to select teams.
                </p>
              )}
              {MODULE_A_OPTIONS.map((opt) => {
                if (!sel.moduleA.options.includes(opt.key)) return null;
                return (
                  <div key={opt.key}>
                    <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-subtle mb-3">
                      Teams — option {opt.key}
                    </div>
                    <TeamGrid
                      selected={sel.moduleA.teamsByOption[opt.key] ?? []}
                      onToggle={(id) => toggleModuleATeam(opt.key, id)}
                    />
                  </div>
                );
              })}
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
                <button
                  type="button"
                  onClick={() =>
                    setBCEnabled(m.id as "B" | "C", !pick.enabled)
                  }
                  className={cn(
                    "self-start inline-flex items-center gap-2 border-4 border-brutal-fg px-4 py-2 font-sans font-black uppercase tracking-tight text-sm transition-colors",
                    pick.enabled
                      ? "bg-brutal-fg text-brutal-bg"
                      : "bg-brutal-bg hover:bg-brutal-muted",
                  )}
                >
                  {pick.enabled ? (
                    <>
                      <Check size={16} strokeWidth={3} /> Include
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Include this module
                    </>
                  )}
                </button>

                {pick.enabled && (
                  <div className="flex flex-col gap-6">
                    {(["masterclass", "workshop"] as FormatKey[]).map(
                      (format) => {
                        const fmt = FORMATS[format];
                        const teams = pick.teamsByFormat[format] ?? [];
                        return (
                          <div key={format}>
                            <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-subtle mb-2">
                              {fmt.label} · {fmt.duration} · {formatEuro(fmt.price)}€
                            </div>
                            <p className="font-mono text-xs text-brutal-soft mb-3 max-w-3xl">
                              {format === "masterclass"
                                ? m.masterclassDesc
                                : m.workshopDesc}
                            </p>
                            <TeamGrid
                              selected={teams}
                              onToggle={(id) =>
                                toggleModuleBCTeam(
                                  m.id as "B" | "C",
                                  format,
                                  id,
                                )
                              }
                            />
                          </div>
                        );
                      },
                    )}
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
                  <Check size={16} strokeWidth={3} /> Include
                </>
              ) : (
                <>
                  <Plus size={16} /> Include this module
                </>
              )}
            </button>

            {sel.moduleD.enabled && (
              <div className="flex flex-wrap items-end gap-8">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-brutal-subtle">
                    Hours
                  </span>
                  <Stepper
                    value={sel.moduleD.hours}
                    onChange={(v) => setD({ hours: v })}
                    min={0}
                    max={48}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-brutal-subtle">
                    Trainers
                  </span>
                  <Stepper
                    value={sel.moduleD.trainers}
                    onChange={(v) => setD({ trainers: v })}
                    min={1}
                    max={6}
                  />
                </div>
                <div className="font-mono text-sm text-brutal-soft">
                  {formatEuro(MODULE_D.pricePerHourPerTrainer)}€ excl. tax / hour / trainer
                </div>
              </div>
            )}

            <MiniSummary lines={moduleDQuote} />
          </div>
        </section>

        {/* DATES */}
        <section className="p-6 md:p-8 flex flex-col gap-5">
          <div className="font-mono text-xs uppercase tracking-[3px] text-brutal-subtle">
            Preferred dates
          </div>
          <div className="flex flex-wrap gap-0 border-t-4 border-l-4 border-brutal-fg">
            {DATES.map((d) => {
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
          <p className="font-mono text-xs text-brutal-faint">
            Share your preferred slots. We'll confirm the agenda together.
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
