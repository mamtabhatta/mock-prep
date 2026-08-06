import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { universities } from "./universities";
import { courseTrackEnum, interviewFormatEnum } from "../enums";

export const courses = pgTable(
    "courses",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        universityId: uuid("university_id")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),

        name: text("name").notNull(),

        track: courseTrackEnum("track")
            .notNull()
            .default("admission"),

        interviewFormat: interviewFormatEnum("interview_format")
            .notNull()
            .default("panel"),

        durationMins: integer("duration_mins"),
        panelSize: integer("panel_size"),

        studentContext: text("student_context"),
        adminNotes: text("admin_notes"),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        universityIdx: index("courses_university_idx").on(
            table.universityId
        ),
    })
);