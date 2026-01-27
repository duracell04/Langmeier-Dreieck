# Verification Notes

## UI change plan (pre-change)
References:
- `spec/ui-style.md` sections 0, 1, 2, 3, 5
- `spec/ux-states.md` sections 1, 4, 5

Plan:
- Use tokens only, add semantic token mapping + base typography/layout utilities (calm, Swiss-professional).
- Build UI kit primitives (Button/Card/Input/Navbar/Footer) that match source radius/shadows.
- Keep student flow behavior intact, especially Join states and feedback ladder.
- Implement landing structure + migrate Join shell without touching core logic.

## Phase 0
- Commands run: none
- Issues fixed: n/a
- Notes: Phase 0 only; no UI changes.

## Phase A
- Commands run: `pnpm build`
- Result: success

## Phase B
- Commands run: `pnpm build`
- Result: success

## Phase C
- Commands run: `pnpm build`
- Result: success

## Phase D
- Commands run: `pnpm build`
- Result: success

## Phase E
- Commands run:
  - `pnpm ui:check`
  - `pnpm lint`
  - `pnpm -r --if-present typecheck`
  - `pnpm build`
- Issues fixed:
  - `pnpm build` failed on `transition-subtle` used in `@apply` (invalid utility); replaced with `transition-all duration-standard ease-swiss` in `packages/theme/base.css`.
- Result: all commands completed successfully after fix.

## Phase F (verification + guardrails)
- Commands run:
  - `pnpm ui:check`
  - `pnpm lint`
  - `pnpm -r --if-present typecheck`
  - `pnpm build`
- Issues fixed:
  - `pnpm ui:check` initially failed due to palette examples in `spec/ui-style.md`; script updated to ignore `docs/` and `spec/`.
- Result: all commands completed successfully after fix.

## Phase G (landing parity)
- Commands run:
  - `pnpm ui:check`
  - `pnpm lint`
  - `pnpm -r --if-present typecheck`
  - `pnpm build`
- Result: all commands completed successfully.

Files changed (non-docs):
- `apps/teacher-dashboard/src/StyleGuide.tsx`
- `apps/teacher-dashboard/src/main.tsx`
- `apps/teacher-dashboard/src/marketing/Landing.tsx`
- `apps/teacher-dashboard/src/marketing/utils.ts`
- `apps/teacher-dashboard/src/marketing/sections/ClassroomFlow.tsx`
- `apps/teacher-dashboard/src/marketing/sections/Credibility.tsx`
- `apps/teacher-dashboard/src/marketing/sections/FooterSection.tsx`
- `apps/teacher-dashboard/src/marketing/sections/Hero.tsx`
- `apps/teacher-dashboard/src/marketing/sections/Pricing.tsx`
- `apps/teacher-dashboard/src/marketing/sections/WhyItWorks.tsx`
- `apps/teacher-dashboard/src/marketing/sections/icons.tsx`
- `packages/ui-kit/src/shared/Footer.tsx`
- `packages/ui-kit/src/shared/Navbar.tsx`

