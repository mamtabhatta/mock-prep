// db/schema/profiles.ts

import {
    pgTable,
    uuid,
    text,
    real,
    integer,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),

    academicBackgroundText: text("academic_background_text"),

    personalStatementText: text("personal_statement_text"),

    ieltsTargetBand: real("ielts_target_band"),

    englishSelfRating: integer("english_self_rating"),

    concernsText: text("concerns_text"),

    targetUniversityId: uuid("target_university_id"),

    targetCourseId: uuid("target_course_id"),

    bio: text("bio"),

    profileImage: varchar("profile_image", { length: 255 }),

    country: varchar("country", { length: 100 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});