import {
  computeQuote,
  DATES,
  initialSelection,
  MODULE_A_OPTIONS,
  MODULE_D,
  MODULES_BCD,
  moduleBCHasTeamSelection,
  type FormatKey,
  type Selection,
  type TeamId,
  TEAMS,
  formatEuro,
} from "./propale";
import { loadSelection } from "./propale-selection";

export const PROPALE_CONTACT_EMAIL = "jeremie@the-tech-nation.com";

const PROPALE_EMAIL_SUBJECT = "Claude Training Proposal - BSport";

function teamLabels(ids: TeamId[]): string {
  if (ids.length === 0) return "None";
  return ids
    .map((id) => TEAMS.find((t) => t.id === id)?.label ?? id)
    .join(", ");
}

function dateLabels(ids: string[]): string {
  if (ids.length === 0) return "Not specified";
  return ids
    .map((id) => DATES.find((d) => d.id === id)?.label ?? id)
    .join(", ");
}


export function hasPropaleSelection(sel: Selection): boolean {
  const hasModuleA = sel.moduleA.options.some(
    (option) => (sel.moduleA.teamsByOption[option]?.length ?? 0) > 0,
  );
  const hasModulesBC = MODULES_BCD.some((m) => {
    const pick = sel.modulesBC[m.id];
    return pick?.enabled && moduleBCHasTeamSelection(pick);
  });
  const hasModuleD = sel.moduleD.enabled && sel.moduleD.hours > 0;
  return hasModuleA || hasModulesBC || hasModuleD || sel.dates.length > 0;
}

export function buildPropaleEmailBody(sel: Selection = initialSelection): string {
  const quote = computeQuote(sel);
  const lines: string[] = [
    "Hello,",
    "",
    "Here is my customized proposal for Claude training at BSport:",
    "",
  ];

  if (!hasPropaleSelection(sel)) {
    lines.push(
      "(No selections configured in the calculator — please reach out so we can define the program.)",
      "",
      "Best regards,",
    );
    return lines.join("\n");
  }

  lines.push("--- MODULE A — CLAUDE CODE ---");
  if (sel.moduleA.options.length > 0) {
    for (const key of sel.moduleA.options) {
      const opt = MODULE_A_OPTIONS.find((o) => o.key === key);
      const teams = sel.moduleA.teamsByOption[key] ?? [];
      lines.push(
        `Option ${key} — ${opt?.title ?? key}: ${teamLabels(teams)}`,
      );
    }
  } else {
    lines.push("Not selected");
  }
  lines.push("");

  for (const m of MODULES_BCD) {
    const pick = sel.modulesBC[m.id];
    lines.push(`--- MODULE ${m.id} — ${m.name.toUpperCase()} ---`);
    if (pick?.enabled) {
      for (const format of ["masterclass", "workshop"] as FormatKey[]) {
        const teams = pick.teamsByFormat[format] ?? [];
        if (teams.length === 0) continue;
        lines.push(
          `${format === "masterclass" ? "Masterclass" : "Workshop"}: ${teamLabels(teams)}`,
        );
      }
      if (!moduleBCHasTeamSelection(pick)) {
        lines.push("No teams selected");
      }
    } else {
      lines.push("Not included");
    }
    lines.push("");
  }

  lines.push(`--- MODULE D — ${MODULE_D.name.toUpperCase()} ---`);
  if (sel.moduleD.enabled) {
    lines.push(`Hours: ${sel.moduleD.hours}h`);
    lines.push(
      `Trainers: ${sel.moduleD.trainers} (${formatEuro(MODULE_D.pricePerHourPerTrainer)}€ excl. tax / h / trainer)`,
    );
  } else {
    lines.push("Not included");
  }
  lines.push("");

  lines.push("--- PREFERRED DATES ---");
  lines.push(dateLabels(sel.dates));
  lines.push("");

  lines.push("--- PRICE SUMMARY (EXCL. TAX) ---");
  if (quote.lines.length === 0) {
    lines.push("No line items — complete team selections per module.");
  } else {
    for (const line of quote.lines) {
      lines.push(`• ${line.label}`);
      lines.push(`  ${line.detail} → ${formatEuro(line.total)} €`);
    }
  }
  lines.push("");
  lines.push(`People covered: ${quote.peopleCovered}`);
  lines.push(`Sessions: ${quote.sessionsCount}`);
  lines.push(`TOTAL EXCL. TAX: ${formatEuro(quote.total)} €`);
  lines.push("");
  lines.push(
    "Indicative prices, excl. tax. In person at BSport.",
  );
  lines.push("");
  lines.push("Best regards,");

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
