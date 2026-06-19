<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Use a casual, coworker tone — straight to the point; keep simple-task responses short.
- Make minimal, focused diffs; do not touch unrelated code or fix parallel compilation errors outside the current scope.
- Label the calculator total "Total cost" (definitive price), not "Estimated total".
- Do not use "negotiable" in pricing or disclaimer copy.
- Run animations always; do not gate on `prefers-reduced-motion` or `motion-reduce` classes.
- Light mode only — no dark theme toggle or `.dark` CSS variables.
- Propale contact email app-wide: `jeremie@the-tech-nation.com`.

## Learned Workspace Facts

- `propale-bsport` is an English BSport Claude-training proposal site with an interactive pricing calculator.
- Pricing and formats live in `app/lib/propale.ts`; UI in `app/components/Calculator.tsx`.
- Deployed on Vercel (`the-tech-nation/propale-bsport`) at `bsport.the-tech-nation.dev`.
- Custom Tailwind `desktop:` breakpoint at 1473px (not standard `lg`).
- Module A (Claude Code) is multiselect: option 1 = masterclass only; options 2 and 3 = workshops only.
- Masterclass capacity 115 people; workshop capacity 25; hackathon rate 350€ excl. tax/hour/trainer.
- Available training dates are defined in the shared `DATES` constant in `propale.ts`.
