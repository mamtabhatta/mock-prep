import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { courses } from "./courses";

export const questionSets = pgTable(
    "question_sets",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        courseId: uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),

        name: text("name").notNull(),
        description: text("description"),

        isActive: boolean("is_active")
            .notNull()
            .default(false),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        courseIdx: index("question_sets_course_idx").on(
            table.courseId
        ),
    })
);