import {
    index,
    pgTable,
    timestamp,
    uuid,
    text,
} from "drizzle-orm/pg-core";

import { courses } from "./courses";
import { questionSets } from "./questionSets";
import { universities } from "./universities";
import { users } from "./users";

import {
    moduleEnum,
    sessionStatusEnum,
} from "../enums";

export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        module: moduleEnum("module")
            .notNull()
            .default("interview"),

        /*
        |--------------------------------------------------------------------------
        | INTERVIEW FORMAT
        |--------------------------------------------------------------------------
        |
        | Used only for interview sessions.
        |
        | Possible values:
        | - Panel
        | - 1-on-1
        | - MMI
        |
        */

        interviewFormat: text("interview_format"),

        universityId: uuid("university_id")
            .references(() => universities.id),

        courseId: uuid("course_id")
            .references(() => courses.id),

        questionSetId: uuid("question_set_id")
            .references(() => questionSets.id),

        status: sessionStatusEnum("status")
            .notNull()
            .default("in_progress"),

        startedAt: timestamp("started_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        submittedAt: timestamp("submitted_at", {
            withTimezone: true,
        }),

        scoredAt: timestamp("scored_at", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },

    (table) => ({
        userIdx: index(
            "sessions_user_idx"
        ).on(table.userId),

        statusIdx: index(
            "sessions_status_idx"
        ).on(table.status),
    })
);