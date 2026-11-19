# One image: the Hono server also serves the built web app.
#   docker build -t bun-hono-stack .
#   docker run -p 3000:3000 --env-file apps/server/.env bun-hono-stack
FROM oven/bun:1.4.5 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1.4.5-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
RUN bun install --frozen-lockfile --production --ignore-scripts --filter ./apps/server
# varlock probes its native helpers at startup and tries to chmod them, which a non-root user cannot do.
RUN find node_modules -name 'varlock-local-encrypt*' -exec chmod a+x {} +

COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/apps/server/.env.schema apps/server/.env.schema
COPY --from=build /app/apps/web/dist apps/web/dist

# The server resolves ../web/dist relative to its working directory.
WORKDIR /app/apps/server
USER bun
EXPOSE 3000
CMD ["bun", "run", "dist/index.mjs"]
