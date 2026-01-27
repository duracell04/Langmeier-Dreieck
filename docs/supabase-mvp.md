# Supabase MVP Setup

This repo uses Supabase for the MVP backend. There is no separate API server.
All student event writes must go through edge functions.

## Schema notes (MVP defaults)

The `classes` table includes default settings required by the student app:
- `pack_id`
- `default_mode` (`learn` | `test`)
- `product_sets` (text array: `products_3_4`, `products_2`, `squares`, `cardinals`, `all_products`)
- `session_length` (10 | 25 | 40)
- `division_enabled` (boolean)
- `square_mode` (`default` | `single`)

These are added in `supabase/migrations/20260127133000_class_defaults.sql`.

## Required env vars (frontend)

Create local env files from the examples:
- `apps/student-pwa/.env.example`
- `apps/teacher-dashboard/.env.example`

Populate:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Local Supabase (recommended for dev)

1) Install Supabase CLI.
2) From repo root:

```powershell
supabase start
supabase db reset
```

3) Set the service role key for edge functions (local or hosted):

```powershell
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

4) Deploy edge functions:

```powershell
supabase functions deploy join_class
supabase functions deploy submit_events
```

## Edge function validation

Edge functions share Zod validation in `supabase/functions/_shared/validation.ts`.
If you change event shapes or class defaults, update:
- `supabase/functions/_shared/validation.ts`
- `packages/types` (compile-time)
- `packages/storage/src/events/validator.ts` (runtime)
- `spec/events-schema.md` (human contract)

## Hosted Supabase

- Apply migrations from `supabase/migrations` in the SQL editor or via CLI.
- Set the `SUPABASE_SERVICE_ROLE_KEY` secret in the Supabase dashboard.
- Deploy edge functions `join_class` and `submit_events`.

## Security notes

- Student events are accepted only via edge functions; direct inserts are blocked by RLS.
- Do not store PII in any payloads. The submit_events function rejects common PII keys.
- Service role keys must never be committed to the repo.
