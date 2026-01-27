# UI QA Checklist (MVP)

Use this checklist before demos and pilots.

## Visual
- [ ] Tokens only (no raw hex in components).
- [ ] Consistent spacing and typography.
- [ ] No layout shift when structure lens appears.

## Student flow
- [ ] Join handles deep link `?code=` and offline message.
- [ ] Practice shows offline badge + retry.
- [ ] Feedback ladder matches phase machine.
- [ ] Keypad is primary input; hardware keyboard optional.

## Teacher flow
- [ ] Auth guarded (login only when signed out).
- [ ] Class defaults stored in DB.
- [ ] Join screen shows code and URL.
- [ ] KPIs from `task_end_events`.

## Accessibility
- [ ] Focus rings on all controls.
- [ ] ARIA labels on keypad.
- [ ] Reduced motion respected.

## Copy
- [ ] All user-facing text in de-CH, no "ß".
