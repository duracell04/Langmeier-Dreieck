# Deployment (MVP)

This MVP deploys as two static Vite builds + Supabase for auth/sync.

Hosting layout (recommended):
- Teacher dashboard at `/` (root)
- Student PWA at `/student`

## 1) Supabase

1. Create a Supabase project (or run `supabase start` locally).
2. Apply migrations in `supabase/migrations`.
3. Set the edge function secret:

   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

4. Deploy edge functions:

   ```bash
   supabase functions deploy join_class
   supabase functions deploy submit_events
   ```

## 2) Environment variables

Student PWA (`apps/student-pwa/.env`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Teacher dashboard (`apps/teacher-dashboard/.env`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STUDENT_APP_URL=/student
```

For local dev, set:

```
VITE_STUDENT_APP_URL=http://localhost:5173
```

Optional paywall placeholder (teacher app only):

```
VITE_ENTITLEMENT_OVERRIDE=pro   # or "free" to force
VITE_SHOW_PAYWALL_PLACEHOLDER=true
```

## 3) Build

From repo root:

```bash
pnpm -r build
```

Artifacts:
- `apps/student-pwa/dist`
- `apps/teacher-dashboard/dist`

Deploy each `dist` folder to any static host (Netlify, Vercel, Cloudflare Pages, S3, etc.).

### Static host rewrites (examples)

Because both apps use hash routing, only the base path needs to resolve to
`index.html`.

Netlify / Cloudflare Pages (`_redirects`):

```
/student/* /student/index.html 200
/* /index.html 200
```

Vercel (`vercel.json`):

```json
{
  "rewrites": [
    { "source": "/student/(.*)", "destination": "/student/index.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 4) Paywall placeholder behavior

- **Default:** hidden (feature-flagged).
- **Unlock (demo):** localStorage flag set to `pro`.
- **Future Stripe:** replace the payments client stub + add webhook to set `class.settings.paid = true`.
