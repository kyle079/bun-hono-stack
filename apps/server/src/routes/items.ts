import {
	itemInsertSchema,
	items,
	itemUpdateSchema,
} from "@bun-hono-stack/db/schema/items";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../lib/db";
import {
	requireSession,
	type SessionVariables,
} from "../middleware/require-session";

const idParam = z.object({ id: z.uuid() });

export const itemsRoute = new Hono<{ Variables: SessionVariables }>()
	.use(requireSession)
	.get("/", async (c) => {
		return c.json(await db.select().from(items).orderBy(desc(items.createdAt)));
	})
	.get("/:id", zValidator("param", idParam), async (c) => {
		const { id } = c.req.valid("param");
		const [item] = await db.select().from(items).where(eq(items.id, id));
		if (!item) return c.json({ error: "Not found" }, 404);
		return c.json(item, 200);
	})
	.post("/", zValidator("json", itemInsertSchema), async (c) => {
		const [item] = await db
			.insert(items)
			.values(c.req.valid("json"))
			.returning();
		return c.json(item, 201);
	})
	.patch(
		"/:id",
		zValidator("param", idParam),
		zValidator("json", itemUpdateSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const [item] = await db
				.update(items)
				.set(c.req.valid("json"))
				.where(eq(items.id, id))
				.returning();
			if (!item) return c.json({ error: "Not found" }, 404);
			return c.json(item, 200);
		},
	)
	.delete("/:id", zValidator("param", idParam), async (c) => {
		const { id } = c.req.valid("param");
		const [item] = await db.delete(items).where(eq(items.id, id)).returning();
		if (!item) return c.json({ error: "Not found" }, 404);
		return c.json(item, 200);
	});
