# human-bubble-atlas

Interactive atlas for exploring human personality dimensions, clusters, and archetypes. Dutch-language UI built with React, Vite, Tailwind, Radix UI, D3, and Recharts.

## Architecture

The project is **client-side only**. All data lives in the React app under `client/src/`; the `shared/` folder contains pure TypeScript type definitions (no database rows).

The `server/` directory exists to serve the built client in production and to run Vite's dev middleware during development. `server/routes.ts` is intentionally a stub — no `/api/*` routes are registered. If backend functionality is added later, wire it up there.

## Layout

- `client/` — React app (pages, components, hooks, viz)
- `server/` — Express host for the client bundle + Vite dev middleware
- `shared/` — Shared TypeScript types (Dimension, Cluster, Preset, UserProfile)
- `script/` — Build tooling (Vite + esbuild)

## Scripts

- `npm run dev` — start dev server (Vite middleware through Express)
- `npm run build` — bundle client (Vite) and server (esbuild CJS) into `dist/`
- `npm run start` — run the production server from `dist/index.cjs`
- `npm run check` — TypeScript type-check
- `npm run lint` — ESLint
- `npm run db:push` — Drizzle Kit schema push (only if a DB is wired up)

## Development

```bash
npm install
npm run dev
```

The server listens on `PORT` (default `5000`) and serves both the client and any future API routes on the same port.
