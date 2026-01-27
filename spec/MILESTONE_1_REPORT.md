# MILESTONE 1 REPORT

Date: 2026-01-27

## Summary

Implemented Supabase schema + RLS and added edge functions for join_class and submit_events. Kept the repo build green.

## Files changed

- supabase/migrations/20260127121400_mvp_schema.sql
- supabase/functions/join_class/index.ts
- supabase/functions/submit_events/index.ts

## Commands run

- pnpm -r build

## Key output

- Build succeeded after running pnpm -r build. Packages with placeholder build scripts reported "not configured" and both Vite apps built successfully.

## Assumptions / decisions

- RLS allows teachers to select only their own classes, students, and events; inserts happen via edge functions using the service role key.
- join_class is idempotent by deviceId per class; otherwise assigns sequential student_number per class.
- submit_events rejects payloads containing common PII keys and enforces studentRef/classId matching per request.
