import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const prompts = pgTable("prompts", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    name: text("name")
        .notNull(),

    version: integer("version")
        .notNull()
        .default(1),

    template: text("template")
        .notNull(),

    isActive: boolean("is_active")
        .notNull()
        .default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Prompt = typeof prompts.$inferSelect;

export type NewPrompt = typeof prompts.$inferInsert;