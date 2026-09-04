import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
    "student",
    "counselor",
    "super_admin",
]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),

    email: varchar("email", { length: 255 }).notNull().unique(),

    // Nullable because Google accounts may not have a password
    passwordHash: varchar("password_hash", { length: 255 }),

    // Google's unique user ID
    googleId: varchar("google_id", { length: 255 }).unique(),

    fullName: varchar("full_name", { length: 255 }).notNull(),

    role: userRole("role").default("student").notNull(),

    isEmailVerified: boolean("is_email_verified")
        .default(false)
        .notNull(),

    isSuspended: boolean("is_suspended")
        .default(false)
        .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});