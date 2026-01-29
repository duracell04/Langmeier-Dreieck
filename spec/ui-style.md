# UI Style Spec - Langmeier-Dreieck (Student PWA)

This is a **contract**. Any UI change must match this spec.
Brand goals: **calm**, **precision**, **non-shaming**, **Swiss-professional**.

If you add a new UI pattern, update this file in the same PR.

---

## 0) Principles (non-negotiable)

1. **One job per screen**
   - Practice screen = triangle + input + minimal status.
   - No menus, no "game world", no visual clutter.

2. **Product is visually dominant**
   - Product value must be the largest number on the triangle.

3. **Non-shaming feedback**
   - Never show "Wrong!" / "Error!" for learning mistakes.
   - Learning mistakes use **warning/info** tones, never danger red.

4. **Tokens only**
   - No hardcoded hex colors outside `tokens.css`.
   - No ad-hoc spacing/typography values; use the scale.

---

## 1) Design tokens (single source of truth)

**File:** `packages/theme/tokens.css`

Rules:
- UI code may use `var(--c-...)` tokens only.
- Do not introduce new colors unless approved.
- Learning feedback colors:
  - correct = `--c-success` (subtle)
  - wrong(1) = `--c-warning` (not red)
  - wrong(2) scaffold = `--c-info`
  - technical error = `--c-danger` only

### 1.1 Tailwind usage (semantic utilities only)
- Use semantic utilities mapped to tokens via `tailwind.preset.cjs`:
  - `bg-bg`, `bg-surface`, `border-border`
  - `text-text-primary`, `text-text-secondary`
  - `text-primary`, `text-success`, `text-warning`, `text-info`, `text-danger`
  - `text-product`, `text-factor`
- Never use raw palette utilities (e.g., `text-red-600`, `bg-blue-500`).

---

## 2) Typography

Goals:
- Legible on older iPads.
- Clear numerals.
- Minimal text in student surfaces.

Rules:
- Student microcopy <= ~5 words where possible.
- Prefer neutral verbs: "Weiter", "Nochmal versuchen".

Recommended usage:
- Product number: `text-product` (or `--text-4xl`+)
- Factors: `text-factor` (or `--text-xl` to `--text-3xl`)
- Micro status: `--text-xs` / `--text-sm`

---

## 3) Layout & spacing

Rules:
- Touch targets >= 44px.
- Use `--space-*` tokens only.
- Triangle centered; keypad bottom, thumb-friendly.
- No arbitrary Tailwind values (avoid `p-[13px]`, `gap-[11px]`).

No "dense" UI:
- Prefer breathing room over information density.

---

## 4) Feedback visuals (calm ladder)

**Correct:**
- Subtle success outline, 200-400ms.
- No confetti, no sound.

**Wrong attempt 1:**
- Show warning outline and microcopy key `feedback.tryAgain`.
- Do not block the student; they can retry immediately.

**Wrong attempt 2:**
- Show info state `feedback.structureExplanation`.
- Show structure lens and reveal correct value.
- Keep the grid visible and allow retries until the student enters the correct answer, then continue.

---

## 5) Motion

Rules:
- All animations must respect `prefers-reduced-motion`.
- Duration tokens only: `--duration-fast/normal/slow`.
- Motion must clarify state change, not entertain.

---

## 6) Accessibility (baseline)

- Contrast: aim for WCAG AA where practical.
- Never rely on color alone: use outline + icon + position.
- Screen reader labels for keypad and focused slot.
- Reduced motion support must be implemented.

---

## 7) Component usage rules

- Prefer `packages/ui-kit` components for:
  - Buttons
  - Feedback flashes/toasts
  - Modal/pause sheet
  - StructureLens container
- No duplicate "mini components" in `apps/student-pwa` if they can live in `ui-kit`.

---

## 8) "Do / Don't" quick list

**Do**
- Calm outlines, subtle highlights
- Short microcopy
- Clear focus on one editable slot

**Don't**
- Red error screens for learning mistakes
- Gamified rewards mid-task
- Long instructions
- Random colors/spacing
