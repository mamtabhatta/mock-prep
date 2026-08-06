import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const emailTokens = pgTable("email_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),

    token: varchar("token", { length: 255 }).notNull(),

    type: varchar("type", { length: 50 }).notNull(), 

    isUsed: boolean("is_used").default(false).notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});