import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const promptModuleEnum = pgEnum("prompt_module", [
    "interview_feedback",
    "ielts_speaking",
    "ielts_writing",
    "ielts_listening_summary",
]);

export const prompts = pgTable("prompts", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    module: promptModuleEnum("module")
        .notNull(),

    version: integer("version")
        .notNull(),

    contentText: text("content_text")
        .notNull(),

    isActive: boolean("is_active")
        .notNull()
        .default(false),

    createdBy: uuid("created_by")
        .references(() => users.id),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Prompt = typeof prompts.$inferSelect;

export type NewPrompt = typeof prompts.$inferInsert;