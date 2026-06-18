export type TeamId = "sales_a" | "sales_b" | "csm_a" | "csm_b" | "g_and_a";

export interface Team {
  id: TeamId;
  label: string;
  count: number;
  note: string;
}

export const TEAMS: Team[] = [
  { id: "sales_a", label: "Sales A", count: 25, note: "moitié des 50 Sales" },
  { id: "sales_b", label: "Sales B", count: 25, note: "moitié des 50 Sales" },
  {
    id: "csm_a",
    label: "CSM A",
    count: 25,
    note: "moitié des 50 Customer Success",
  },
  {
    id: "csm_b",
    label: "CSM B",
    count: 25,
    note: "moitié des 50 Customer Success",
  },
  { id: "g_and_a", label: "G&A", count: 15, note: "fonctions support" },
];

export const TOTAL_PEOPLE = TEAMS.reduce((s, t) => s + t.count, 0);

export const FORMATS = {
  masterclass: {
    label: "Masterclass",
    capacity: 100,
    duration: "1h",
    trainers: 2,
    price: 1200,
    blurb: "On présente, on installe, on démontre. Peu d'interactivité.",
  },
  workshop: {
    label: "Workshop",
    capacity: 25,
    duration: "1h30",
    trainers: 4,
    price: 2200,
    blurb: "Interactif. Assistance personnalisée, questions.",
  },
} as const;

export type FormatKey = keyof typeof FORMATS;

export type ModuleAOption = "1" | "2" | "3" | "2+3";

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
    audience: "tout le monde",
    duration: "1h",
    format: "masterclass",
    deroule: "Présentation (5 min) → Possibilités (10 min) → Setup (45 min)",
    cover:
      "Ce qu'est Claude Code, ce que ça peut faire, installation en live pour chaque participant.",
  },
  {
    key: "2",
    title: "Claude Code + Augmented Sales",
    audience: "équipes sales",
    duration: "1h30",
    format: "workshop",
    deroule: "Intro & installation + setup + fonctionnalités Augmented Sales",
    cover:
      "Installation, puis comment brancher les outils, automatiser le process de vente, augmenter la productivité commerciale.",
  },
  {
    key: "3",
    title: "Claude Code + My Personal Assistant",
    audience: "tout le monde",
    duration: "1h30",
    format: "workshop",
    deroule: "Intro & installation + setup + personal assistant / second brain",
    cover:
      "Installation, puis comment brancher le mail et les outils, créer un second brain, automatiser son process de vente / son quotidien.",
  },
];

export const MODULES_BCD = [
  {
    id: "B",
    name: "Inspiration",
    tagline:
      "Pas du technique pur — des idées applicables sur leur métier et leurs use cases.",
    formats: ["masterclass", "workshop"] as FormatKey[],
    masterclassDesc:
      "Démonstration d'un use case choisi. On montre, on inspire.",
    workshopDesc:
      "Sessions interactives. On creuse leurs cas concrets, on ouvre des pistes sur leur métier.",
    cover: "Inspiration sur leurs use cases et leur business.",
  },
  {
    id: "C",
    name: "Claude Chat & Cowork — setup & optimisation",
    tagline:
      "BSport a déjà Claude Chat et Cowork. Ici on optimise l'usage, on ne réinstalle pas.",
    formats: ["masterclass", "workshop"] as FormatKey[],
    masterclassDesc:
      "Démonstration des bonnes pratiques : skills, routines, connecteurs, projets, prompt instruction, automatisation.",
    workshopDesc:
      "Mise en pratique avec les équipes : skills, routines, connecteurs natifs, projets, comment prompter (contexte, simplification), automatisation.",
    cover:
      "Skills, routines, connecteurs natifs, projets, instruction de prompt, automatisation.",
  },
] as const;

export const MODULE_D = {
  id: "D",
  name: "Intervenants hackathon",
  tagline:
    "BSport organise un hackathon. Notre équipe circule parmi les participants pour débloquer, aider, corriger, orienter — en direct, au fil de l'eau.",
  pricePerHourPerTrainer: 300,
  defaultTrainers: 2,
};

export const DATES = [
  { id: "2026-06-29", label: "29 juin" },
  { id: "2026-06-30", label: "30 juin" },
  { id: "2026-07-03", label: "3 juillet" },
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
  option: ModuleAOption | null;
  teams: TeamId[];
}
export interface ModuleBCPick {
  enabled: boolean;
  format: FormatKey;
  teams: TeamId[];
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
  moduleA: { option: null, teams: [] },
  modulesBC: {
    B: { enabled: false, format: "masterclass", teams: [] },
    C: { enabled: false, format: "masterclass", teams: [] },
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

export function computeQuote(sel: Selection): Quote {
  const lines: LineItem[] = [];

  if (sel.moduleA.option && sel.moduleA.teams.length > 0) {
    const isCombined = sel.moduleA.option === "2+3";
    const opt = MODULE_A_OPTIONS.find((o) => o.key === sel.moduleA.option);

    if (opt?.key === "1") {
      const s = masterclassSessionsForTeams(sel.moduleA.teams);
      if (s > 0)
        lines.push({
          label: `Claude Code — ${opt.title}`,
          detail: `Masterclass 1h × ${s}`,
          sessions: s,
          unitPrice: FORMATS.masterclass.price,
          total: s * FORMATS.masterclass.price,
        });
    } else if (opt || isCombined) {
      const perTeam = workshopSessionsForTeams(sel.moduleA.teams);
      const multiplier = isCombined ? 2 : 1;
      const s = perTeam * multiplier;
      if (s > 0) {
        const label = isCombined
          ? "Claude Code — Augmented Sales + Personal Assistant"
          : `Claude Code — ${opt!.title}`;
        lines.push({
          label,
          detail: `Workshop 1h30 × ${s}`,
          sessions: s,
          unitPrice: FORMATS.workshop.price,
          total: s * FORMATS.workshop.price,
        });
      }
    }
  }

  for (const m of MODULES_BCD) {
    const pick = sel.modulesBC[m.id];
    if (!pick || !pick.enabled || pick.teams.length === 0) continue;
    if (pick.format === "masterclass") {
      const s = masterclassSessionsForTeams(pick.teams);
      if (s > 0)
        lines.push({
          label: `Module ${m.id} — ${m.name}`,
          detail: `Masterclass 1h × ${s}`,
          sessions: s,
          unitPrice: FORMATS.masterclass.price,
          total: s * FORMATS.masterclass.price,
        });
    } else {
      const s = workshopSessionsForTeams(pick.teams);
      if (s > 0)
        lines.push({
          label: `Module ${m.id} — ${m.name}`,
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
  sel.moduleA.teams.forEach((t) => {
    allTeams.add(t);
  });
  for (const m of MODULES_BCD) {
    sel.modulesBC[m.id].teams.forEach((t) => {
      allTeams.add(t);
    });
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
      label: "Intervenants hackathon",
      detail: `${sel.moduleD.hours}h × ${sel.moduleD.trainers} formateur${sel.moduleD.trainers > 1 ? "s" : ""} × 300€`,
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
  return n.toLocaleString("fr-FR");
}
