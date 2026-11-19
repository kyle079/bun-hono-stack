import type { AppType } from "@bun-hono-stack/server";
import { hc } from "hono/client";

import { ENV } from "../env";

// Development: the API runs on its own port. Production: the server also serves
// this app, so API calls are same-origin.
export const serverUrl = import.meta.env.PROD
	? window.location.origin
	: ENV.VITE_SERVER_URL;

export const api = hc<AppType>(serverUrl, {
	init: { credentials: "include" },
});
