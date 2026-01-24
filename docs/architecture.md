# Architecture Overview

This repo is a PNPM workspace monorepo with clear separation of concerns.

Authoritative contracts and detailed specs live under `spec/`.
This document is a lightweight index to help orient new contributors.

## Repo layout (high level)

- `apps/student-pwa` - Student practice UI (Vite + React)
- `apps/teacher-dashboard` - Teacher UI (Vite + React)
- `packages/core-engine` - Pure pedagogy and session logic
- `packages/storage` - IndexedDB + event log + sync client
- `packages/types` - Domain and event types (source of truth)
- `packages/validation` - Runtime schemas (Zod)
- `services/api` - Sync ingestion + aggregates + exports

## Specs and contracts

- Core brief: `spec/brief_v1.md`
- Event schema: `spec/events-schema.md`
- Mastery logic: `spec/mastery-algorithm.md`
- Offline sync: `spec/offline-sync.md`
- Privacy posture: `spec/privacy-posture.md`
- UI style contract: `spec/ui-style.md`

If this file conflicts with the specs, the specs win.
