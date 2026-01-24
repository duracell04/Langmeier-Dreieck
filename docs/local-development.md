# Local Development

Quick start for running the apps in this monorepo.

## Prereqs

- Node.js (any recent LTS)
- PNPM via Corepack (recommended)

## Install

From the repo root:

```powershell
corepack enable
pnpm install
```

## Run the apps

### Student PWA

```powershell
pnpm dev
```

Vite dev server: http://localhost:5173

### Teacher dashboard

In a second terminal:

```powershell
pnpm --filter @triangle/teacher-dashboard dev
```

Vite dev server: http://localhost:5174

### API (placeholder)

```powershell
pnpm dev:api
```

This currently prints a message only; no dev server is configured yet.

## Other useful scripts

```powershell
pnpm build
pnpm test
pnpm lint
```

## Troubleshooting

- If ports 5173/5174 are taken, update:
  - `apps/student-pwa/vite.config.ts`
  - `apps/teacher-dashboard/vite.config.ts`
