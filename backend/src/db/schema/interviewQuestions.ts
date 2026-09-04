import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import { sessions } from "./sessions";

export const interviewQuestions = pgTable(
    "interview_questions",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        sessionId: uuid("session_id")
            .notNull()
            .references(() => sessions.id, {
                onDelete: "cascade",
            }),

        questionText: text("question_text")
            .notNull(),

        category: varchar("category", {
            length: 100,
        }),

        difficulty: varchar("difficulty", {
            length: 50,
        }),

        questionOrder: integer("question_order")
            .notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        sessionIdx: index(
            "interview_questions_session_idx"
        ).on(table.sessionId),
    })
);