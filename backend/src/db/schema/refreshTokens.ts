import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),

    token: varchar("token", { length: 500 }).notNull(),

    isRevoked: boolean("is_revoked").default(false).notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});