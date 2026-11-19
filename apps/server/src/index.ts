import "varlock/auto-load";

import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { auth } from "./lib/auth";
import { ENV } from "./lib/env";
import { itemsRoute } from "./routes/items";

const app = new Hono()
	.use(logger())
	.use(
		"/*",
		cors({
			origin: ENV.CORS_ORIGIN,
			allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
	.get("/health", (c) => c.text("OK"))
	.route("/api/items", itemsRoute);

// Production: serve the built web app from the same origin, with client routes
// falling back to index.html. Registered after the API so it never shadows it.
// Paths are relative to the working directory (apps/server).
if (ENV.NODE_ENV === "production") {
	app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));
	app.use("/*", serveStatic({ root: "../web/dist" }));
	app.get("/*", serveStatic({ path: "../web/dist/index.html" }));
}

export type AppType = typeof app;

export default app;
