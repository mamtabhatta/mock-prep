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

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

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