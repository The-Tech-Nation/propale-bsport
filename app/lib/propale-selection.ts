import {
  DATES,
  initialSelection,
  MODULE_A_OPTIONS,
  type FormatKey,
  type ModuleAOption,
  type ModuleBCPick,
  type Selection,
  TEAMS,
  type TeamId,
} from "./propale";

const VALID_MODULE_A_OPTIONS = new Set<ModuleAOption>(
  MODULE_A_OPTIONS.map((o) => o.key),
);

function filterTeamIds(ids: unknown): TeamId[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((t): t is TeamId => TEAMS.some((x) => x.id === t));
}

function normalizeModuleATeamsByOption(
  parsed:
    | (Partial<Selection>["moduleA"] & { teams?: TeamId[] })
    | undefined,
  options: ModuleAOption[],
): Partial<Record<ModuleAOption, TeamId[]>> {
  const raw = parsed?.teamsByOption;
  if (raw && typeof raw === "object") {
    const out: Partial<Record<ModuleAOption, TeamId[]>> = {};
    for (const key of VALID_MODULE_A_OPTIONS) {
      const teams = filterTeamIds(raw[key]);
      if (teams.length > 0) out[key] = teams;
    }
    return out;
  }

  const legacyTeams = filterTeamIds(parsed?.teams);
  if (legacyTeams.length === 0 || options.length === 0) return {};
  return Object.fromEntries(
    options.map((option) => [option, legacyTeams]),
  ) as Partial<Record<ModuleAOption, TeamId[]>>;
}

function normalizeModuleAOptions(
  parsed:
    | (Partial<Selection>["moduleA"] & { option?: string | null })
    | undefined,
): ModuleAOption[] {
  if (Array.isArray(parsed?.options)) {
    return parsed.options.filter((o): o is ModuleAOption =>
      VALID_MODULE_A_OPTIONS.has(o as ModuleAOption),
    );
  }
  if (parsed?.option === "2+3") return ["2", "3"];
  if (
    parsed?.option &&
    VALID_MODULE_A_OPTIONS.has(parsed.option as ModuleAOption)
  ) {
    return [parsed.option as ModuleAOption];
  }
  return [];
}

function normalizeModuleBCTeamsByFormat(
  parsed:
    | (Partial<ModuleBCPick> & { format?: FormatKey; teams?: TeamId[] })
    | undefined,
): Partial<Record<FormatKey, TeamId[]>> {
  const raw = parsed?.teamsByFormat;
  if (raw && typeof raw === "object") {
    const out: Partial<Record<FormatKey, TeamId[]>> = {};
    const mc = filterTeamIds(raw.masterclass);
    const ws = filterTeamIds(raw.workshop);
    if (mc.length > 0) out.masterclass = mc;
    if (ws.length > 0) out.workshop = ws;
    return out;
  }

  const legacyTeams = filterTeamIds(parsed?.teams);
  if (legacyTeams.length === 0) return {};
  const format: FormatKey =
    parsed?.format === "workshop" ? "workshop" : "masterclass";
  return { [format]: legacyTeams };
}

function normalizeModuleBCPick(
  parsed:
    | (Partial<ModuleBCPick> & { format?: FormatKey; teams?: TeamId[] })
    | undefined,
): ModuleBCPick {
  return {
    enabled: parsed?.enabled ?? false,
    teamsByFormat: normalizeModuleBCTeamsByFormat(parsed),
  };
}

export const PROPALE_SELECTION_STORAGE_KEY = "bsport-propale-selection-v1";

export function normalizeSelection(parsed: Partial<Selection>): Selection {
  const moduleAOptions = normalizeModuleAOptions(parsed.moduleA);
  return {
    moduleA: {
      options: moduleAOptions,
      teamsByOption: normalizeModuleATeamsByOption(parsed.moduleA, moduleAOptions),
    },
    modulesBC: {
      B: normalizeModuleBCPick(parsed.modulesBC?.B),
      C: normalizeModuleBCPick(parsed.modulesBC?.C),
    },
    moduleD: {
      enabled: parsed.moduleD?.enabled ?? false,
      hours: Math.max(0, Math.min(48, parsed.moduleD?.hours ?? 0)),
      trainers: Math.max(1, Math.min(6, parsed.moduleD?.trainers ?? 2)),
    },
    dates: Array.isArray(parsed.dates)
      ? parsed.dates.filter((d) => DATES.some((x) => x.id === d))
      : [],
  };
}

export function loadSelection(): Selection {
  if (typeof window === "undefined") return initialSelection;
  try {
    const raw = localStorage.getItem(PROPALE_SELECTION_STORAGE_KEY);
    if (!raw) return initialSelection;
    return normalizeSelection(JSON.parse(raw) as Partial<Selection>);
  } catch {
    return initialSelection;
  }
}
