# DESIGN SYSTEM (MVP)

This document defines the UI system for Langmeier-Dreieck MVP. It is a contract for all UI work.
All user-facing copy must be de-CH (Swiss High German), without "ß".

## 1) Tokens and theming

Source of truth:
- `packages/theme/tokens.css`
- `tailwind.preset.cjs`

Rules:
- Use semantic tokens only (e.g., `bg-bg`, `text-ink`, `border-grid-border`).
- No raw hex colors in app code.
- Spacing and radius must use tokenized Tailwind utilities only.

## 2) Typography

- Primary font: `--font-main` (defined in tokens).
- Product values use `text-product`; factors use `text-factor`.
- Microcopy uses `text-micro` or `text-sm`.
- Avoid long sentences on student screens.

## 3) Layout and spacing

- Touch targets >= 44px.
- Student practice layout: triangle centered, keypad at bottom.
- Layout must not shift when structure lens appears (reserve space).

## 4) Feedback ladder

States:
- wrong1: "Nochmal versuchen."
- wrong2: "Schauen wir auf die Struktur."
- wrong3: reveal answer + "Diese Aufgabe kommt wieder."

Rules:
- Never use shame language.
- Use warning/info tones for learning mistakes (not danger).

## 5) Accessibility

- Focus-visible rings on all interactive elements.
- Keypad buttons have ARIA labels.
- Respect prefers-reduced-motion.

## 6) Offline UX

- Show a calm offline badge in practice.
- Provide a manual retry control for sync when online.

## 7) Component usage

Prefer shared components from `packages/ui-kit`:
- Buttons, Cards, Badges, Tables, PracticeFrame, FeedbackLadder.

## 8) Copy guidance

- Use de-CH without "ß".
- Prefer calm, short phrasing.
