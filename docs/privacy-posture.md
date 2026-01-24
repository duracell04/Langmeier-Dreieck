# Privacy Posture (Overview)

This is a short overview. The authoritative specification is:
- `spec/privacy-posture.md`

## Summary

- No student PII stored server-side (names/emails/phones/addresses/DOB).
- Student identity is pseudonymous via `studentRef`.
- Server rejects payloads containing PII keys (scrubber).

Implementation notes:
- Privacy enforcement code lives in `services/api/src/privacy`.
