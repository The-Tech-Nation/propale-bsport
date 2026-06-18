import {
  computeQuote,
  DATES,
  initialSelection,
  MODULE_A_OPTIONS,
  MODULE_D,
  MODULES_BCD,
  type ModuleAOption,
  type Selection,
  type TeamId,
  TEAMS,
  formatEuro,
} from "./propale";
import { loadSelection } from "./propale-selection";

export const PROPALE_CONTACT_EMAIL = "jeremie@the-tech-nation.com";

const PROPALE_EMAIL_SUBJECT = "Proposition Claude - BSport";

function teamLabels(ids: TeamId[]): string {
  if (ids.length === 0) return "Aucune";
  return ids
    .map((id) => TEAMS.find((t) => t.id === id)?.label ?? id)
    .join(", ");
}

function dateLabels(ids: string[]): string {
  if (ids.length === 0) return "Non renseignées";
  return ids
    .map((id) => DATES.find((d) => d.id === id)?.label ?? id)
    .join(", ");
}

function moduleATitle(option: ModuleAOption | null): string {
  if (!option) return "Aucune";
  if (option === "2+3") return "Augmented Sales + Personal Assistant";
  return MODULE_A_OPTIONS.find((o) => o.key === option)?.title ?? option;
}

export function hasPropaleSelection(sel: Selection): boolean {
  const hasModuleA =
    sel.moduleA.option !== null && sel.moduleA.teams.length > 0;
  const hasModulesBC = MODULES_BCD.some((m) => {
    const pick = sel.modulesBC[m.id];
    return pick?.enabled && pick.teams.length > 0;
  });
  const hasModuleD = sel.moduleD.enabled && sel.moduleD.hours > 0;
  return hasModuleA || hasModulesBC || hasModuleD || sel.dates.length > 0;
}

export function buildPropaleEmailBody(sel: Selection = initialSelection): string {
  const quote = computeQuote(sel);
  const lines: string[] = [
    "Bonjour,",
    "",
    "Voici ma proposition personnalisée pour la formation Claude chez BSport :",
    "",
  ];

  if (!hasPropaleSelection(sel)) {
    lines.push(
      "(Aucune sélection configurée dans le calculateur — merci de me recontacter pour définir le programme.)",
      "",
      "Cordialement,",
    );
    return lines.join("\n");
  }

  lines.push("--- MODULE A — CLAUDE CODE ---");
  if (sel.moduleA.option) {
    lines.push(`Option : ${moduleATitle(sel.moduleA.option)}`);
    lines.push(`Équipes : ${teamLabels(sel.moduleA.teams)}`);
  } else {
    lines.push("Non sélectionné");
  }
  lines.push("");

  for (const m of MODULES_BCD) {
    const pick = sel.modulesBC[m.id];
    lines.push(`--- MODULE ${m.id} — ${m.name.toUpperCase()} ---`);
    if (pick?.enabled) {
      lines.push(
        `Format : ${pick.format === "masterclass" ? "Masterclass" : "Workshop"}`,
      );
      lines.push(`Équipes : ${teamLabels(pick.teams)}`);
    } else {
      lines.push("Non inclus");
    }
    lines.push("");
  }

  lines.push(`--- MODULE D — ${MODULE_D.name.toUpperCase()} ---`);
  if (sel.moduleD.enabled) {
    lines.push(`Heures : ${sel.moduleD.hours}h`);
    lines.push(
      `Formateurs : ${sel.moduleD.trainers} (${MODULE_D.pricePerHourPerTrainer}€ HT / h / formateur)`,
    );
  } else {
    lines.push("Non inclus");
  }
  lines.push("");

  lines.push("--- DATES SOUHAITÉES ---");
  lines.push(dateLabels(sel.dates));
  lines.push("");

  lines.push("--- RÉCAPITULATIF PRIX (HT) ---");
  if (quote.lines.length === 0) {
    lines.push("Aucune ligne tarifaire — complétez les équipes par module.");
  } else {
    for (const line of quote.lines) {
      lines.push(`• ${line.label}`);
      lines.push(`  ${line.detail} → ${formatEuro(line.total)} €`);
    }
  }
  lines.push("");
  lines.push(`Personnes couvertes : ${quote.peopleCovered}`);
  lines.push(`Sessions : ${quote.sessionsCount}`);
  lines.push(`TOTAL HT : ${formatEuro(quote.total)} €`);
  lines.push("");
  lines.push(
    "Prix indicatifs, hors taxes. En présentiel chez BSport.",
  );
  lines.push("");
  lines.push("Cordialement,");

  return lines.join("\n");
}

export function buildPropaleMailtoUrl(
  sel: Selection = initialSelection,
): string {
  const subject = encodeURIComponent(PROPALE_EMAIL_SUBJECT);
  const body = encodeURIComponent(buildPropaleEmailBody(sel));
  return `mailto:${PROPALE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export function openPropaleEmail(): void {
  if (typeof window === "undefined") return;
  window.location.href = buildPropaleMailtoUrl(loadSelection());
}
