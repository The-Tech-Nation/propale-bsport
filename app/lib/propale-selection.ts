import {
  DATES,
  initialSelection,
  type Selection,
  TEAMS,
  type TeamId,
} from "./propale";

export const PROPALE_SELECTION_STORAGE_KEY = "bsport-propale-selection-v1";

export function normalizeSelection(parsed: Partial<Selection>): Selection {
  return {
    moduleA: {
      option: parsed.moduleA?.option ?? null,
      teams: Array.isArray(parsed.moduleA?.teams)
        ? parsed.moduleA.teams.filter((t): t is TeamId =>
            TEAMS.some((x) => x.id === t),
          )
        : [],
    },
    modulesBC: {
      B: {
        enabled: parsed.modulesBC?.B?.enabled ?? false,
        format:
          parsed.modulesBC?.B?.format === "workshop"
            ? "workshop"
            : "masterclass",
        teams: Array.isArray(parsed.modulesBC?.B?.teams)
          ? parsed.modulesBC.B.teams.filter((t): t is TeamId =>
              TEAMS.some((x) => x.id === t),
            )
          : [],
      },
      C: {
        enabled: parsed.modulesBC?.C?.enabled ?? false,
        format:
          parsed.modulesBC?.C?.format === "workshop"
            ? "workshop"
            : "masterclass",
        teams: Array.isArray(parsed.modulesBC?.C?.teams)
          ? parsed.modulesBC.C.teams.filter((t): t is TeamId =>
              TEAMS.some((x) => x.id === t),
            )
          : [],
      },
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
