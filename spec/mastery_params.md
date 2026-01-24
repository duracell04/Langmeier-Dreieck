# Mastery Parameters (Spec)

This file defines the tunable parameters for the mastery queue.
It should be updated when the algorithm or defaults change.

If this file conflicts with code or tests, update the code and tests
in the same change and keep this file in sync.

## Scope

- ProductFamily-level mastery scheduling
- Learn/Test mode differences
- Re-queue timing and bucket rules

## Parameters (v1)

TBD. Proposed fields:

- `buckets`: ordered list of buckets (e.g., fresh -> short -> medium -> long)
- `correctStreakToAdvance`: consecutive correct needed to move up
- `wrongPenalty`: how far to move down on a wrong answer
- `requeueDelayMs`: delay before a wrong item is re-asked
- `maxQueueSize`: guardrail for session queue growth
- `divisionReinforceBias`: probability of inverse multiplication after a division error
- `learnModeAids`: structure lens and hint rules
- `testModeAids`: structure lens and hint rules

Fill in concrete values before pilots or any classroom use.
