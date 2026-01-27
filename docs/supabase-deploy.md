# Supabase Deploy (MVP)

This repo uses Supabase migrations + edge functions. Run commands from repo root.

## 1) Link project (one time)
```bash
supabase link --project-ref <PROJECT_REF>
```

## 2) Push database schema
```bash
supabase db push
```

## 3) Set required secrets
```bash
supabase secrets set SUPABASE_URL="https://<PROJECT_REF>.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"
```

## 4) Deploy edge functions
```bash
supabase functions deploy join_class
supabase functions deploy submit_events
```

## 5) (Optional) Local function testing
```bash
supabase functions serve --env-file supabase/.env.local
```
