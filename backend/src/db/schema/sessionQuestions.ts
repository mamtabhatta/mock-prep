import {
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
        uniqueIndex,
} from "drizzle-orm/pg-core";

import { sessions } from "./sessions";
import { questions } from "./questions";
import { questionTypeEnum } from "../enums";

export const sessionQuestions = pgTable(
    "session_questions",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        sessionId: uuid("session_id")
            .notNull()
            .references(() => sessions.id, {
                onDelete: "cascade",
            }),

        questionId: uuid("question_id")
            .references(() => questions.id, {
                onDelete: "set null",
            }),

        text: text("text")
            .notNull(),

        content: jsonb("content"),

        type: questionTypeEnum("type"),

        orderIndex: integer("order_index")
            .notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },

    (table) => ({
        sessionIdx: index(
            "session_questions_session_idx"
        ).on(table.sessionId),

       sessionOrderIdx: uniqueIndex(
    "session_questions_session_order_unique"
).on(
    table.sessionId,
    table.orderIndex
),
    })
);