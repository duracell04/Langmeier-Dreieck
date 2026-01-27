# ENGINE_RULES

Source of truth for core task generation, queues, and task identity. This file is authoritative and is linked to:
- PRODUCT_STORY (UX + practice states): spec/PRODUCT_STORY.md
- DATA_BACKEND (events + sync): spec/DATA_BACKEND.md

## Domain primitives
- Relation: (a, b, p) with a * b = p.
- Factor pair: [a, b] where a * b = product.
- ProductFamily: { id, product, factorPairs[] }.
- Task variant fields:
  - familyId
  - pair: [a, b]
  - operation: "mul" | "div"
  - missing: "product" | "left" | "right"
  - divisionMeaning: "quotitive" | "partitive"
  - swap: "keep" | "swap"
  - squareMode: "default" | "single" (see Squares special-case)
  - taskKey: stable identity string (see Stable task key rules)

## Learn queue policy (deterministic)
- Deterministic order: same input families produce identical plan.
- Per family, per pair:
  1) multiplication with missing product (swap=keep).
  2) if a != b, multiplication with missing product (swap=swap) immediately adjacent.
  3) multiplication with missing factor (left then right), swap=keep.
  4) division variants are appended in stable order:
     - quotitive: product / divisor = quotient (missing quotient).
     - partitive: product / quotient = divisor (missing divisor).
- Division variants must not flip meaning between runs.

## Test queue policy (seeded + fair)
- Use seeded RNG per session (see DATA_BACKEND session identity).
- Fairness: avoid over-representing the same family; recent family window = 2-3.
- Anti-swap spacing: do not show swapped orientation within N=2 tasks of each other.
- Mix operation and missing slots according to configured mode (learn/test).

## Requeue policy
- On third wrong attempt: reinsert the task with minSpacing=6.
- Respect swap spacing when reinserting.
- Density cap: do not allow more than 2 requeues in any window of 4 tasks, and no more than 2 consecutive requeues.

## Stable task key rules
- taskKey must be deterministic and stable; never use random UUIDs for identity.
- Required components: familyId, pair (ordered), operation, missing, divisionMeaning, swap.
- Example format: "family:{id}|pair:{a}x{b}|op:{op}|miss:{m}|div:{meaning}|swap:{swap}".

## Squares special-case
- When a == b, allow optional mode to hide both factors with a shared input.
- In Learn mode, after a correct answer, reveal both factors and reinforce relation.
- In Test mode, do not reveal until task end; keep timing consistent with PRODUCT_STORY.

## Structure lens semantics
- Render a 10x10 grid fill from 1..product using rows x cols of the current factors.
- The lens must not highlight the correct answer in a way that gives it away (no auto-filled factors or emphasized boundaries).

## Required unit tests
- Deterministic learn plan (same families => identical plan order).
- Seeded test picker determinism (same seed => same sequence).
- Swap spacing: swapped orientation not shown within N=2.
- Requeue minSpacing=6 enforced.
- Density cap: max 2 requeues per window of 4.
