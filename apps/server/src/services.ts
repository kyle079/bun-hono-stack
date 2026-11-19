import { createAuth } from "@bun-hono-stack/auth";
import { createDb } from "@bun-hono-stack/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
