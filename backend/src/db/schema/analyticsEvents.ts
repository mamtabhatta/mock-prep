import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { sessions } from "./sessions";

export const analyticsEvents = pgTable("analytics_events", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    userId: uuid("user_id"),

    sessionId: uuid("session_id")
        .references(() => sessions.id, { onDelete: "cascade" }),

    eventType: text("event_type")
        .notNull(),

    metadata: jsonb("metadata")
        .$type<Record<string, unknown>>()
        .default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;