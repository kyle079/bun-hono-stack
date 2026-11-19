# bun-hono-stack

A TypeScript stack where each thing is defined once and everything else is derived from it: Drizzle tables produce the Zod schemas, Hono routes produce the typed client, and the web app uses both.

- Bun (runtime and package manager), Turborepo, Biome
- `apps/server`: Hono API, Hono RPC, Better Auth (email/password, optional SSO)
- `apps/web`: React, Vite, TanStack Router/Query/Table/Form, shadcn primitives, Tailwind
- `packages/db`: Drizzle schema and Postgres

<!-- template:start -->
## Create a project

Requires [Bun](https://bun.sh) and, for local Postgres, Docker.

```bash
bun create kyle079/bun-hono-stack my-app
```

This creates `./my-app` in the directory you run it from. The create step downloads the template, sets the root package name to `my-app`, runs `bun install`, and then runs `scripts/rename.ts`. That script replaces `bun-hono-stack` with your project name everywhere (package scope, imports, page title, Docker and database names, docs), reinstalls so the lockfile matches, runs Biome to re-sort imports, folds the result into the initial commit, and deletes itself. Names are normalised to lowercase letters, digits and hyphens.

<!-- template:end -->
## Setup

Requires [Bun](https://bun.sh) and Docker (for local Postgres).

```bash
bun install
```

Theme tokens are switched in `apps/web/src/index.css`; see [CONVENTIONS.md](CONVENTIONS.md#6-themes-and-components).

## Environment

Each app declares its variables in `.env.schema` (validated and typed by [varlock](https://varlock.dev)); `bun install` generates the typed `src/env.ts` files. Local defaults for the URLs and the database are in the schema. Create `apps/server/.env` with the one value that has no default:

```
BETTER_AUTH_SECRET=<at least 32 random characters>
```

The `SSO_*` variables are optional and blank by default. Fill in `SSO_DOMAIN`, `SSO_ISSUER`, `SSO_CLIENT_ID` and `SSO_CLIENT_SECRET` to register an OIDC provider. Real `.env` files are git-ignored.

## Run locally

```bash
bun run db:start     # Postgres in Docker on port 5432
bun run db:push      # apply the schema (there are no migrations or seed data)
bun run dev          # web on http://localhost:3001, API on http://localhost:3000
```

Other commands: `bun run check` (Biome, writes fixes), `bun run check-types`, `bun test`, `bun run build`. The full list is in [AGENTS.md](AGENTS.md).

## Production

One container: the Hono server serves the built web app and the API from the same origin.

```bash
docker build -t bun-hono-stack .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/dbname \
  -e BETTER_AUTH_SECRET=<32+ characters> \
  -e BETTER_AUTH_URL=https://app.example.com \
  -e CORS_ORIGIN=https://app.example.com \
  bun-hono-stack
```

`BETTER_AUTH_URL` and `CORS_ORIGIN` are the public URL of the container, over HTTPS (auth cookies are `Secure`). The image does not run migrations; apply your schema to the database separately.

## Conventions

[CONVENTIONS.md](CONVENTIONS.md) describes the layout, naming, how to add a resource, and what Biome and CI enforce.
