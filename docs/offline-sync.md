# Offline Sync (Overview)

This is a short overview. The authoritative specification is:
- `spec/offline-sync.md`

## Summary

- Client always writes events locally first.
- Sync uploads events since last ack and is idempotent.
- Server dedupes by event id and assigns server receive time.
- Client never deletes local events until acked.
