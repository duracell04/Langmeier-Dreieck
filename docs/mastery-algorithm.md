# Mastery Algorithm (Overview)

This is a short overview. The authoritative specification is:
- `spec/mastery-algorithm.md`

If you need to change or discuss the algorithm, edit the spec first and
keep this overview in sync.

## Summary

- Mastery is tracked at the ProductFamily level.
- Correct answers increase interval and/or bucket.
- Wrong answers cause short re-queue and bucket downshift.
- Division errors bias the next items toward inverse multiplication in
  the same family to reinforce relational understanding.
