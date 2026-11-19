import { createDb } from "@bun-hono-stack/db";

import { ENV } from "./env";

export const db = createDb(ENV.DATABASE_URL);
