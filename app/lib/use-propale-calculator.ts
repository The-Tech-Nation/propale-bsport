"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeQuote,
  initialSelection,
  type FormatKey,
  type ModuleAOption,
  type Selection,
  type TeamId,
} from "./propale";
import {
  loadSelection,
  PROPALE_SELECTION_STORAGE_KEY,
} from "./propale-selection";

export function usePropaleCalculator() {
  const [sel, setSel] = useState<Selection>(initialSelection);
  const [hydrated, setHydrated] = useState(false);

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

  return {
    sel,
    quote,
    toggleModuleBCTeam,
    toggleModuleATeam,
    toggleModuleAOption,
    setBCEnabled,
    setD,
    toggleDate,
    reset,
  };
}
