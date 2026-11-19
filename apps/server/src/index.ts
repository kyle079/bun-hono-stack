import "varlock/auto-load";

import { Hono } from "hono";
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
	.get("/", (c) => c.text("OK"))
	.route("/api/items", itemsRoute);

export type AppType = typeof app;

export default app;
