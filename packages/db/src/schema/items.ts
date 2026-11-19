import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";

export const itemStatuses = ["draft", "active", "archived"] as const;

export const items = pgTable("items", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	notes: text("notes"),
	status: text("status", { enum: itemStatuses }).notNull().default("draft"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export type Item = typeof items.$inferSelect;

export const itemSelectSchema = createSelectSchema(items);

export const itemInsertSchema = createInsertSchema(items, {
	name: (schema) => schema.min(1, "Name is required").max(200),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const itemUpdateSchema = itemInsertSchema.partial();
