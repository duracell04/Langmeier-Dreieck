# apps/student-pwa/AGENTS.md - UI rules

You are editing the Student PWA. UI must match Brandbook: calm, precise, non-shaming.

Before changing any UI:
1) Open and follow `/spec/ui-style.md`
2) Open and follow `/spec/ux-states.md`

Hard rules:
- Tokens only (from `src/styles/tokens.css`). No hex colors.
- Feedback ladder must match engine contract:
  wrong #1 = try again, wrong #2 = structure flash + reveal + continue.
- Keep student text minimal. Use i18n keys only.
- Prefer `packages/ui-kit` components over local duplicates.

When you propose a change:
- First write a short plan referencing the relevant section(s) of the two spec files.
- Then implement the smallest diff that satisfies the plan.
