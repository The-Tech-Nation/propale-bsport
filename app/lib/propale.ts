export type TeamId = "sales_a" | "sales_b" | "csm_a" | "csm_b" | "g_and_a";

export interface Team {
  id: TeamId;
  label: string;
  count: number;
  note: string;
}

export const TEAMS: Team[] = [
  { id: "sales_a", label: "Sales A", count: 25, note: "half of 50 Sales" },
  { id: "sales_b", label: "Sales B", count: 25, note: "half of 50 Sales" },
  {
    id: "csm_a",
    label: "CSM A",
    count: 25,
    note: "half of 50 Customer Success",
  },
  {
    id: "csm_b",
    label: "CSM B",
    count: 25,
    note: "half of 50 Customer Success",
  },
  { id: "g_and_a", label: "G&A", count: 15, note: "support functions" },
];

export const TOTAL_PEOPLE = TEAMS.reduce((s, t) => s + t.count, 0);

export const FORMATS = {
  masterclass: {
    label: "Masterclass",
    capacity: 115,
    duration: "1h",
    trainers: 2,
    price: 1200,
    blurb: "We present, install, and demo. Limited interactivity.",
  },
  workshop: {
    label: "Workshop",
    capacity: 25,
    duration: "1h30",
    trainers: 4,
    price: 2200,
    blurb: "Interactive. Hands-on support and Q&A.",
  },
} as const;

export type FormatKey = keyof typeof FORMATS;

export type ModuleAOption = "1" | "2" | "3";

export interface ModuleAOptionDef {
  key: ModuleAOption;
  title: string;
  audience: string;
  duration: string;
  format: FormatKey | "workshop";
  deroule: string;
  cover: string;
}

export const MODULE_A_OPTIONS: ModuleAOptionDef[] = [
  {
    key: "1",
    title: "Intro & Installation Claude Code",
    audience: "everyone",
    duration: "1h",
    format: "masterclass",
    deroule: "Overview (5 min) → Capabilities (10 min) → Setup (45 min)",
    cover:
      "What Claude Code is, what it can do, live installation for every participant.",
  },
  {
    key: "2",
    title: "Claude Code + Augmented Sales",
    audience: "sales teams",
    duration: "1h30",
    format: "workshop",
    deroule: "Intro & install + setup + Augmented Sales features",
    cover:
      "Installation, then how to connect tools, automate the sales process, and boost commercial productivity.",
  },
  {
    key: "3",
    title: "Claude Code + My Personal Assistant",
    audience: "everyone",
    duration: "1h30",
    format: "workshop",
    deroule: "Intro & install + setup + personal assistant / second brain",
    cover:
      "Installation, then how to connect email and tools, build a second brain, and automate your sales process / daily workflow.",
  },
];

export const MODULES_BCD = [
  {
    id: "B",
    name: "Inspiration",
    tagline:
      "Not pure tech: ideas they can apply to their role and use cases.",
    formats: ["masterclass", "workshop"] as FormatKey[],
    masterclassDesc:
      "Demo of a chosen use case. We show, we inspire.",
    workshopDesc:
      "Interactive sessions. We dig into their real cases and open paths for their business.",
    cover: "Inspiration on their use cases and business.",
  },
  {
    id: "C",
    name: "Claude Chat & Cowork: setup & optimization",
    tagline:
      "BSport already has Claude Chat and Cowork. Here we optimize usage, no reinstall.",
    formats: ["masterclass", "workshop"] as FormatKey[],
    masterclassDesc:
      "Best practices demo: skills, routines, connectors, projects, prompt instructions, automation.",
    workshopDesc:
      "Hands-on with teams: skills, routines, native connectors, projects, how to prompt (context, simplification), automation.",
    cover:
      "Skills, routines, native connectors, projects, prompt instructions, automation.",
  },
] as const;

export const MODULE_D = {
  id: "D",
  name: "Hackathon facilitators",
  tagline:
    "BSport runs a hackathon. Our team roams the floor to unblock, help, fix, and guide, live, as it happens.",
  pricePerHourPerTrainer: 350,
  defaultTrainers: 2,
};

export const DATES = [
  { id: "2026-06-29", label: "Jun 29" },
  { id: "2026-06-30", label: "Jun 30" },
  { id: "2026-07-01", label: "Jul 1" },
  { id: "2026-07-03", label: "Jul 3" },
];

export const ceil = (n: number) => Math.ceil(n);

export function workshopSessionsForTeams(teamIds: TeamId[]): number {
  return teamIds.reduce((sum, id) => {
    const t = TEAMS.find((x) => x.id === id);
    return sum + (t ? ceil(t.count / FORMATS.workshop.capacity) : 0);
  }, 0);
}

export function masterclassSessionsForTeams(teamIds: TeamId[]): number {
  const total = teamIds.reduce((sum, id) => {
    const t = TEAMS.find((x) => x.id === id);
    return sum + (t ? t.count : 0);
  }, 0);
  if (total === 0) return 0;
  return ceil(total / FORMATS.masterclass.capacity);
}

export interface ModuleAPick {
  options: ModuleAOption[];
  teamsByOption: Partial<Record<ModuleAOption, TeamId[]>>;
}
export interface ModuleBCPick {
  enabled: boolean;
  teamsByFormat: Partial<Record<FormatKey, TeamId[]>>;
}
export interface ModuleDPick {
  enabled: boolean;
  hours: number;
  trainers: number;
}

export interface Selection {
  moduleA: ModuleAPick;
  modulesBC: Record<string, ModuleBCPick>;
  moduleD: ModuleDPick;
  dates: string[];
}

export const initialSelection: Selection = {
  moduleA: { options: [], teamsByOption: {} },
  modulesBC: {
    B: { enabled: false, teamsByFormat: {} },
    C: { enabled: false, teamsByFormat: {} },
  },
  moduleD: { enabled: false, hours: 0, trainers: MODULE_D.defaultTrainers },
  dates: [],
};

export interface LineItem {
  label: string;
  detail: string;
  sessions: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  lines: LineItem[];
  total: number;
  sessionsCount: number;
  peopleCovered: number;
}

export function moduleATeamsForOption(
  pick: ModuleAPick,
  option: ModuleAOption,
): TeamId[] {
  return pick.teamsByOption[option] ?? [];
}

export function moduleBCTeamsForFormat(
  pick: ModuleBCPick,
  format: FormatKey,
): TeamId[] {
  return pick.teamsByFormat[format] ?? [];
}

export function moduleBCHasTeamSelection(pick: ModuleBCPick): boolean {
  return (
    (pick.teamsByFormat.masterclass?.length ?? 0) > 0 ||
    (pick.teamsByFormat.workshop?.length ?? 0) > 0
  );
}

export function computeQuote(sel: Selection): Quote {
  const lines: LineItem[] = [];

  for (const key of sel.moduleA.options) {
    const teams = moduleATeamsForOption(sel.moduleA, key);
    if (teams.length === 0) continue;

    const opt = MODULE_A_OPTIONS.find((o) => o.key === key);
    if (!opt) continue;

    if (opt.key === "1") {
      const s = masterclassSessionsForTeams(teams);
      if (s > 0)
        lines.push({
          label: `Claude Code: ${opt.title}`,
          detail: `Masterclass 1h × ${s}`,
          sessions: s,
          unitPrice: FORMATS.masterclass.price,
          total: s * FORMATS.masterclass.price,
        });
    } else {
      const s = workshopSessionsForTeams(teams);
      if (s > 0)
        lines.push({
          label: `Claude Code: ${opt.title}`,
          detail: `Workshop 1h30 × ${s}`,
          sessions: s,
          unitPrice: FORMATS.workshop.price,
          total: s * FORMATS.workshop.price,
        });
    }
  }

  for (const m of MODULES_BCD) {
    const pick = sel.modulesBC[m.id];
    if (!pick?.enabled) continue;

    const mcTeams = moduleBCTeamsForFormat(pick, "masterclass");
    if (mcTeams.length > 0) {
      const s = masterclassSessionsForTeams(mcTeams);
      if (s > 0)
        lines.push({
          label: `Module ${m.id}: ${m.name}`,
          detail: `Masterclass 1h × ${s}`,
          sessions: s,
          unitPrice: FORMATS.masterclass.price,
          total: s * FORMATS.masterclass.price,
        });
    }

    const wsTeams = moduleBCTeamsForFormat(pick, "workshop");
    if (wsTeams.length > 0) {
      const s = workshopSessionsForTeams(wsTeams);
      if (s > 0)
        lines.push({
          label: `Module ${m.id}: ${m.name}`,
          detail: `Workshop 1h30 × ${s}`,
          sessions: s,
          unitPrice: FORMATS.workshop.price,
          total: s * FORMATS.workshop.price,
        });
    }
  }

  let sessionsCount = 0;
  let peopleCovered = 0;

  const allTeams = new Set<TeamId>();
  for (const key of sel.moduleA.options) {
    moduleATeamsForOption(sel.moduleA, key).forEach((t) => {
      allTeams.add(t);
    });
  }
  for (const m of MODULES_BCD) {
    const pick = sel.modulesBC[m.id];
    for (const format of ["masterclass", "workshop"] as FormatKey[]) {
      moduleBCTeamsForFormat(pick, format).forEach((t) => {
        allTeams.add(t);
      });
    }
  }
  peopleCovered = Array.from(allTeams).reduce(
    (s, id) => s + (TEAMS.find((t) => t.id === id)?.count ?? 0),
    0,
  );

  if (sel.moduleD.enabled && sel.moduleD.hours > 0) {
    const t =
      sel.moduleD.hours *
      sel.moduleD.trainers *
      MODULE_D.pricePerHourPerTrainer;
    lines.push({
      label: "Hackathon facilitators",
      detail: `${sel.moduleD.hours}h × ${sel.moduleD.trainers} trainer${sel.moduleD.trainers > 1 ? "s" : ""} × ${formatEuro(MODULE_D.pricePerHourPerTrainer)}€`,
      sessions: sel.moduleD.hours,
      unitPrice: MODULE_D.pricePerHourPerTrainer * sel.moduleD.trainers,
      total: t,
    });
  }

  sessionsCount = lines
    .filter((l) => !l.label.includes("hackathon"))
    .reduce((s, l) => s + l.sessions, 0);

  const total = lines.reduce((s, l) => s + l.total, 0);

  return { lines, total, sessionsCount, peopleCovered };
}

export function formatEuro(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}
