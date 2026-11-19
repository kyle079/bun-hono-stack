import { defineRelations } from "drizzle-orm";

import * as auth from "./schema/auth";
import * as items from "./schema/items";

const schema = { ...auth, ...items };

export const relations = {
	...defineRelations(schema),
	...auth.authRelations,
};
