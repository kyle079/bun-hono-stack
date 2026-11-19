import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./relations";

export function createDb(url: string) {
	return drizzle(url, { relations });
}

export type Database = ReturnType<typeof createDb>;
