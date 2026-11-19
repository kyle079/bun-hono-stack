# AGENTS.md

bun-hono-stack: Bun monorepo. Hono API with Hono RPC (`apps/server`), React with TanStack Router/Query/Table/Form (`apps/web`), Drizzle and Postgres (`packages/db`). Zod schemas are derived from Drizzle tables. Better Auth for sessions and SSO. Biome, Turborepo, `bun test`. Use `bun` and `bunx`, not npm or node.

Read CONVENTIONS.md before changing code.

## Commands

- `bun run dev` - web (port 3001) and server (port 3000)
- `bun run check` - Biome, writes fixes; `bun run check:ci` is the read-only version
- `bun run check-types`
- `bun test`
- `bun run build`
- `bun run db:start`, `db:stop`, `db:down`, `db:watch`, `db:push`, `db:generate`, `db:migrate`, `db:studio`
- `bun run auth:generate` - regenerate Better Auth tables into `packages/db/src/schema/auth.ts`

## Do not

- Add service, repository or controller layers.
- Redeclare types that can be derived from a table, schema or route.
- Add a CLAUDE.md. This file is the agent entry point.
- Commit generated files (`routeTree.gen.ts`, `src/env.ts`, `dist/`, `.env`).
