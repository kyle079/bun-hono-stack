import type { AppType } from "@bun-hono-stack/server";
import { hc } from "hono/client";

import { ENV } from "../env";

export const api = hc<AppType>(ENV.VITE_SERVER_URL, {
	init: { credentials: "include" },
});
