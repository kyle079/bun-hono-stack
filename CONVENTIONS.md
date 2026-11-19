# Conventions

This file is the single source of rules for bun-hono-stack. If code and this file disagree, fix one of them in the same change.

## 1. Directory layout

```
apps/server/src/
  index.ts                 Hono app; exports AppType and the default app
  routes/<resource>.ts     one Hono router per resource (+ <resource>.test.ts)
  middleware/              Hono middleware (require-session.ts)
  lib/                     auth.ts (Better Auth), db.ts (client), env.ts (generated)
apps/web/src/
  routes/                  TanStack Router file routes; thin, they wire a feature to a URL
  features/<resource>/     everything for one resource: page, table, form, queries.ts
  components/              shared app-level components (header, sign-in form)
  components/ui/           shadcn primitives
  lib/                     api.ts (Hono RPC client), auth-client.ts, utils.ts
  themes/                  CSS token sets
packages/db/
  src/schema/<resource>.ts table, derived types, derived Zod schemas
  src/index.ts             createDb()
  src/relations.ts         Drizzle relations
  docker-compose.yml       local Postgres
  drizzle.config.ts        drizzle-kit config
```

## 2. Naming

- Files and directories are kebab-case. The file name is the kebab-case form of its main export: `items-table.tsx` exports `ItemsTable`.
- TanStack Router files keep the router's own names (`__root.tsx`, `$id.tsx`, `_auth/`). `routeTree.gen.ts` is generated.
- One name per resource across every layer, plural, same spelling: `packages/db/src/schema/items.ts` -> `apps/server/src/routes/items.ts` -> `apps/web/src/features/items/`.

## 3. Adding a resource

The walk-through uses `items`. Use your resource's name and touch the same places in the same order.

1. **Table.** `packages/db/src/schema/items.ts` defines `items` with `pgTable`. This is the only place columns are written down. The row type is `typeof items.$inferSelect`.
2. **Zod schemas, derived.** In the same file, `createSelectSchema(items)` and `createInsertSchema(items, { name: (s) => s.min(1) })` from `drizzle-orm/zod`. Drop generated columns with `.omit(...)`. The update schema is `itemInsertSchema.partial()`. Do not write a Zod object by hand for a column that exists in the table.
3. **Route.** `apps/server/src/routes/items.ts` is a Hono router built as one chain of `.get/.post/...` calls so its type survives. Request bodies and params go through `zValidator("json", itemInsertSchema)`, so validation and types come from step 2. Handlers query `db` directly. Mount it in `apps/server/src/index.ts` with `.route("/api/items", itemsRoute)`.
4. **RPC client.** Nothing to write. `apps/web/src/lib/api.ts` creates `hc<AppType>()`, so `api.api.items.$get()` already exists with typed inputs and outputs.
5. **Query options.** `apps/web/src/features/items/queries.ts` holds `queryOptions` and the mutation hooks. Types come from the client: `InferResponseType<typeof api.api.items.$get, 200>`, `InferRequestType<...>["json"]`.
6. **Table and form.** `items-table.tsx` (TanStack Table) and `item-form.tsx` (TanStack Form). The form validates with the same `itemInsertSchema`, imported from `@bun-hono-stack/db/schema/items`.
7. **Route file.** `apps/web/src/routes/_auth/items.tsx` calls `createFileRoute`, loads `itemsQueryOptions`, and renders `ItemsPage`.
8. **Database.** Apply the new table with your own process; see section 8.

## 4. Types: derive, never declare

- Row types: `typeof table.$inferSelect` / `$inferInsert`.
- Validation types: `z.infer<typeof schema>` (`z.input` / `z.output` when they differ).
- API types on the web side: `InferResponseType` / `InferRequestType` from `hono/client`. The web app learns the API shape only through `AppType`.
- Auth types: `auth.$Infer.Session`.
- No `types/` folder. No hand-written DTOs or interfaces that restate a table, a schema or a route.

If a type cannot be derived from one of these, the source of truth is missing a definition. Add it there.

## 5. What not to add

- **Service, repository or controller layers.** A route handler queries Drizzle directly. A wrapper that forwards to Drizzle is a second definition of every query. Extract a function only when two routes need the same non-trivial logic.
- **Barrel files** (a file that only re-exports). Import from the file that defines the thing.
- **`helpers/`, `common/`, `utils/` folders.** They collect unrelated code. Name the file after what it does.
- **Default exports.** Named exports only, so renames are tracked and imports are greppable. Exceptions are files a tool loads by convention: `*.config.ts` and the server entry `apps/server/src/index.ts`, which Bun serves.
- **Premature sharing.** Code used by one feature stays in that feature's folder. Move it to a shared location (`components/`, `lib/`) when a second feature needs it.
- **Wrong-way imports.** Dependencies point `apps/web` -> `apps/server` (the `AppType` type only) -> `packages/db`. `packages/db` imports nothing from the apps; `apps/server` never imports from `apps/web`.

## 6. Themes and components

- **Tokens:** `apps/web/src/index.css` has a single theme import, `@import "./themes/default.css";`. Change the file name to switch: `default.css` (plain shadcn), `darkmatter.css` (the tweakcn "darkmatter" theme, monospace) or `rum.css` (RUM tokens; its dark values are derived, see the note in the file). Application code uses semantic tokens (`bg-background`, `text-foreground`) and does not hard-code colors.
- **Components:** plain shadcn primitives in `apps/web/src/components/ui/`. Add new ones with the shadcn CLI from `apps/web` (`bunx shadcn@latest add <name>`); after that they are ordinary source you own.

## 7. Enforced and not enforced

Enforced by Biome (`bun run check`; CI runs `bun run check:ci`, then type checks, tests and the build):

- kebab-case file names (`style/useFilenamingConvention`).
- No default exports (`style/noDefaultExport`), off for `*.config.ts` and `apps/server/src/index.ts`.
- No barrel files and no `export *` (`performance/noBarrelFile`, `performance/noReExportAll`), off for `apps/web/src/lib/utils.ts`, the file shadcn expects to export `cn`.
- Import direction (`style/noRestrictedImports`, one override per package): `packages/db` cannot import from the apps, `apps/server` cannot import from `apps/web`, and `apps/web` can import only the name `AppType` from `@bun-hono-stack/server`. The rule cannot tell `import type` from a value import, so the web restriction is by name; `style/useImportType` covers the rest.
- Formatting, import order and Biome's recommended rules.

Not enforced; keep to it in review:

- No service/repository/controller layers, no `helpers/` folders, no `types/` folder.
- Derive types instead of declaring them.
- One resource name across schema, route and feature.
- Code stays in its feature until a second feature needs it.

## 8. Database

The template ships no migrations and no seed data. `packages/db/drizzle.config.ts` writes migrations to `packages/db/src/migrations/`, which does not exist until you generate it. Apply schema changes with whichever process you choose:

- `bun run db:push` pushes the current schema straight to the database (quick, for local development).
- `bun run db:generate` writes SQL migrations and `bun run db:migrate` applies them. Commit the generated migrations if you adopt this flow.
- `bun run db:studio` opens Drizzle Studio.
- Local Postgres: `bun run db:start`, `db:watch` (foreground), `db:stop`, `db:down`.

Better Auth tables live in `packages/db/src/schema/auth.ts`. After changing auth plugins or options, run `bun run auth:generate` and review the diff.
