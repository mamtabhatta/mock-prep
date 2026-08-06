import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const universities = pgTable("universities", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    country: text("country").notNull().default("United Kingdom"),
    description: text("description"),

    logoUrl: text("logo_url"),
    interviewOverview: text("interview_overview"),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});