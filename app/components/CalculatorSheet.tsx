"use client";

import { Check, Minus, Plus, X } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { buildPropaleMailtoUrl } from "../lib/propale-mailto";
import {
  DATES,
  FORMATS,
  formatEuro,
  MODULE_A_OPTIONS,
  MODULE_D,
  MODULES_BCD,
  TEAMS,
  type FormatKey,
  type TeamId,
} from "../lib/propale";
import { usePropaleCalculator } from "../lib/use-propale-calculator";
import { AnimatedNumber } from "./AnimatedNumber";
import { CTAButton } from "./Calculator";

const cn = (...c: (string | false | undefined | null)[]) =>
  c.filter(Boolean).join(" ");

const GRID =
  "grid grid-cols-[minmax(0,1fr)_repeat(5,3rem)_5.5rem] md:grid-cols-[minmax(0,1fr)_repeat(5,4rem)_6.5rem]";

function CellCheck({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-label={label}
      aria-pressed={checked}
      className={cn(
        "flex size-full min-h-12 items-center justify-center border-l-4 border-brutal-fg transition-colors",
        disabled && "opacity-30 cursor-not-allowed",
        checked
          ? "bg-brutal-fg text-brutal-bg"
          : "bg-brutal-bg hover:bg-brutal-muted",
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center border-2 border-current",
          checked ? "bg-brutal-accent text-brutal-fg" : "bg-brutal-bg",
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}

function SheetRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(GRID, "border-b-4 border-brutal-fg", className)}>
      {children}
    </div>
  );
}

function LabelCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center gap-3 px-4 py-3 font-mono text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function AmountCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center justify-end border-l-4 border-brutal-fg px-3 font-sans font-black text-sm md:text-base tabular-nums",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TeamChecks({
  selected,
  onToggle,
  disabled,
  prefix,
}: {
  selected: TeamId[];
  onToggle: (id: TeamId) => void;
  disabled?: boolean;
  prefix: string;
}) {
  return TEAMS.map((t) => (
    <CellCheck
      key={t.id}
      checked={selected.includes(t.id)}
      onChange={() => onToggle(t.id)}
      disabled={disabled}
      label={`${prefix} — ${t.label}`}
    />
  ));
}

const MODULE_BC_FORMATS: FormatKey[] = ["masterclass", "workshop"];

function StepperCompact({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <span className="inline-flex items-stretch border-2 border-brutal-fg">
      <button
        type="button"
        onClick={() => set(value - 1)}
        className="px-1.5 bg-brutal-bg hover:bg-brutal-muted border-r-2 border-brutal-fg"
        aria-label="decrease"
      >
        <Minus size={12} />
      </button>
      <span className="min-w-8 px-2 flex items-center justify-center font-sans font-black text-sm bg-brutal-fg text-brutal-bg">
        {value}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        className="px-1.5 bg-brutal-bg hover:bg-brutal-muted border-l-2 border-brutal-fg"
        aria-label="increase"
      >
        <Plus size={12} />
      </button>
    </span>
  );
}

export function CalculatorSheet() {
  const {
    sel,
    quote,
    toggleModuleBCTeam,
    toggleModuleATeam,
    toggleModuleAOption,
    setBCEnabled,
    setD,
    toggleDate,
    reset,
  } = usePropaleCalculator();

  const moduleALines = quote.lines.filter((l) =>
    l.label.startsWith("Claude Code"),
  );
  const moduleATotal = moduleALines.reduce((s, l) => s + l.total, 0);

  const optionLineTotal = (title: string) =>
    quote.lines
      .filter((l) => l.label === `Claude Code — ${title}`)
      .reduce((s, l) => s + l.total, 0);

  const moduleBCFormatTotal = (
    moduleId: string,
    moduleName: string,
    format: FormatKey,
  ) => {
    const detailPrefix =
      format === "masterclass" ? "Masterclass" : "Workshop";
    return quote.lines
      .filter(
        (l) =>
          l.label === `Module ${moduleId} — ${moduleName}` &&
          l.detail.startsWith(detailPrefix),
      )
      .reduce((s, l) => s + l.total, 0);
  };

  const moduleDTotal = quote.lines
    .filter((l) => l.label.includes("hackathon"))
    .reduce((s, l) => s + l.total, 0);

  return (
    <div className="border-4 border-brutal-fg overflow-x-auto">
      <div className="min-w-[36rem]">
      {/* Header */}
      <SheetRow className="bg-brutal-muted">
        <LabelCell className="font-sans font-black uppercase tracking-tight text-xs md:text-sm">
          Module
        </LabelCell>
        {TEAMS.map((t) => (
          <div
            key={t.id}
            className="flex min-h-12 flex-col items-center justify-center border-l-4 border-brutal-fg px-1 py-2 text-center"
          >
            <span className="font-sans font-black uppercase text-[10px] md:text-xs leading-tight">
              {t.label}
            </span>
            <span className="font-mono text-[9px] text-brutal-faint hidden md:block">
              {t.count}p
            </span>
          </div>
        ))}
        <AmountCell className="justify-center font-mono text-[10px] uppercase tracking-wider text-brutal-subtle">
          excl. tax
        </AmountCell>
      </SheetRow>

      {/* Module A — section label */}
      <div className="border-b-4 border-brutal-fg bg-brutal-muted px-4 py-3 font-sans font-black uppercase tracking-tight">
        A · Claude Code
      </div>

      {/* Module A — options */}
      {MODULE_A_OPTIONS.map((opt) => {
        const on = sel.moduleA.options.includes(opt.key);
        const isMc = opt.format === "masterclass";
        const optionTeams = sel.moduleA.teamsByOption[opt.key] ?? [];
        const optionTotal = optionLineTotal(opt.title);
        return (
          <SheetRow key={opt.key}>
            <LabelCell>
              <button
                type="button"
                onClick={() => toggleModuleAOption(opt.key)}
                className="flex items-start gap-3 text-left w-full group"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center border-2 border-brutal-fg mt-0.5",
                    on ? "bg-brutal-fg text-brutal-bg" : "bg-brutal-bg",
                  )}
                >
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="font-sans font-black uppercase tracking-tight text-sm block">
                    Opt {opt.key} · {opt.title}
                  </span>
                  <span className="text-xs text-brutal-subtle">
                    {isMc ? "Masterclass" : "Workshop"} · {opt.duration}
                  </span>
                </span>
              </button>
            </LabelCell>
            <TeamChecks
              selected={optionTeams}
              onToggle={(id) => toggleModuleATeam(opt.key, id)}
              disabled={!on}
              prefix={`Option ${opt.key}`}
            />
            <AmountCell>
              {optionTotal > 0 ? `${formatEuro(optionTotal)}€` : "—"}
            </AmountCell>
          </SheetRow>
        );
      })}

      {/* Module A subtotal */}
      {moduleATotal > 0 && (
        <SheetRow className="bg-brutal-muted/50">
          <LabelCell className="text-xs uppercase tracking-wider text-brutal-subtle">
            Claude Code subtotal
          </LabelCell>
          <div className="col-span-5 border-l-4 border-brutal-fg" />
          <AmountCell>{formatEuro(moduleATotal)}€</AmountCell>
        </SheetRow>
      )}

      {/* Modules B & C */}
      {MODULES_BCD.map((m) => {
        const pick = sel.modulesBC[m.id];
        const moduleTotal = quote.lines
          .filter((l) => l.label === `Module ${m.id} — ${m.name}`)
          .reduce((s, l) => s + l.total, 0);

        return (
          <Fragment key={m.id}>
            <div className="border-b-4 border-brutal-fg bg-brutal-muted px-4 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setBCEnabled(m.id as "B" | "C", !pick.enabled)
                }
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center border-2 border-brutal-fg",
                    pick.enabled
                      ? "bg-brutal-fg text-brutal-bg"
                      : "bg-brutal-bg",
                  )}
                >
                  {pick.enabled && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="font-sans font-black uppercase tracking-tight text-sm">
                  {m.id} · {m.name}
                </span>
              </button>
            </div>

            {MODULE_BC_FORMATS.map((format) => {
              const fmt = FORMATS[format];
              const teams = pick.teamsByFormat[format] ?? [];
              const formatTotal = moduleBCFormatTotal(m.id, m.name, format);

              return (
                <SheetRow key={`${m.id}-${format}`}>
                  <LabelCell className="flex-col items-start gap-0.5">
                    <span className="font-sans font-black uppercase tracking-tight text-sm">
                      {fmt.label}
                    </span>
                    <span className="text-xs text-brutal-faint">
                      {fmt.duration} · {formatEuro(fmt.price)}€
                    </span>
                  </LabelCell>
                  <TeamChecks
                    selected={teams}
                    onToggle={(id) =>
                      toggleModuleBCTeam(m.id as "B" | "C", format, id)
                    }
                    disabled={!pick.enabled}
                    prefix={`${m.id} ${fmt.label}`}
                  />
                  <AmountCell>
                    {formatTotal > 0 ? `${formatEuro(formatTotal)}€` : "—"}
                  </AmountCell>
                </SheetRow>
              );
            })}

            {pick.enabled && moduleTotal > 0 && (
              <SheetRow className="bg-brutal-muted/50">
                <LabelCell className="text-xs uppercase tracking-wider text-brutal-subtle">
                  Subtotal {m.id}
                </LabelCell>
                <div className="col-span-5 border-l-4 border-brutal-fg" />
                <AmountCell>{formatEuro(moduleTotal)}€</AmountCell>
              </SheetRow>
            )}
          </Fragment>
        );
      })}

      {/* Module D */}
      <SheetRow>
        <LabelCell>
          <div className="flex flex-wrap items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setD({ enabled: !sel.moduleD.enabled })}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center border-2 border-brutal-fg",
                  sel.moduleD.enabled
                    ? "bg-brutal-fg text-brutal-bg"
                    : "bg-brutal-bg",
                )}
              >
                {sel.moduleD.enabled && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="font-sans font-black uppercase tracking-tight text-sm">
                D · {MODULE_D.name}
              </span>
            </button>
            {sel.moduleD.enabled && (
              <>
                <span className="text-xs text-brutal-subtle">Hours</span>
                <StepperCompact
                  value={sel.moduleD.hours}
                  onChange={(v) => setD({ hours: v })}
                  min={0}
                  max={48}
                />
                <span className="text-xs text-brutal-subtle">Trainers</span>
                <StepperCompact
                  value={sel.moduleD.trainers}
                  onChange={(v) => setD({ trainers: v })}
                  min={1}
                  max={6}
                />
                <span className="text-xs text-brutal-faint">
                  {formatEuro(MODULE_D.pricePerHourPerTrainer)}€/h/f
                </span>
              </>
            )}
          </div>
        </LabelCell>
        <div className="col-span-5 border-l-4 border-brutal-fg" />
        <AmountCell>
          {moduleDTotal > 0 ? `${formatEuro(moduleDTotal)}€` : "—"}
        </AmountCell>
      </SheetRow>

      {/* Dates */}
      <div className="border-b-4 border-brutal-fg">
        <LabelCell className="text-xs uppercase tracking-wider text-brutal-subtle border-b-4 border-brutal-fg">
          Preferred dates
        </LabelCell>
        <div className="flex w-full">
          {DATES.map((d) => {
            const on = sel.dates.includes(d.id);
            return (
              <button
                type="button"
                key={d.id}
                onClick={() => toggleDate(d.id)}
                className={cn(
                  "flex-1 min-w-0 px-4 py-3 flex items-center justify-between gap-2 border-r-4 border-b-4 border-brutal-fg transition-colors",
                  on
                    ? "bg-brutal-fg text-brutal-bg"
                    : "bg-brutal-bg hover:bg-brutal-muted",
                )}
              >
                <span className="font-sans font-black uppercase tracking-tight text-sm">
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
      </div>

      {/* Breakdown */}
      {quote.lines.length > 0 && (
        <div className="border-b-4 border-brutal-fg">
          {quote.lines.map((l) => (
            <div
              key={`${l.label}-${l.detail}`}
              className="flex items-center justify-between gap-4 px-4 py-3 border-b-2 border-brutal-fg/20 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="font-sans font-black uppercase tracking-tight text-xs">
                  {l.label}
                </div>
                <div className="font-mono text-[11px] text-brutal-faint">
                  {l.detail}
                </div>
              </div>
              <div className="font-sans font-black text-sm tabular-nums shrink-0">
                {formatEuro(l.total)}€
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total footer */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6 bg-brutal-fg text-brutal-bg">
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[3px] text-brutal-accent">
            Total cost
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="font-sans font-black uppercase tracking-tighter text-4xl md:text-5xl leading-none">
              <AnimatedNumber value={quote.total} />
            </span>
            <span className="font-sans font-black uppercase text-lg text-brutal-secondary">
              € excl. tax
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-brutal-on-dark-muted">
            <span>
              <span className="font-sans font-black text-brutal-bg">
                {quote.peopleCovered}
              </span>{" "}
              people
            </span>
            <span>
              <span className="font-sans font-black text-brutal-bg">
                {quote.sessionsCount}
              </span>{" "}
              sessions
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
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
            className="inline-flex items-center gap-2 border-2 border-brutal-bg/40 px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:border-brutal-secondary hover:text-brutal-secondary transition-colors"
          >
            <X size={14} /> Reset
          </button>
        </div>
      </div>

      <p className="px-4 py-3 font-mono text-[11px] text-brutal-faint">
        Indicative prices, excl. tax. In person at BSport.
      </p>
      </div>
    </div>
  );
}
