import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { sessions } from "./sessions";
import { sessionQuestions } from "./sessionQuestions";

export const sessionAnswers = pgTable(
    "session_answers",
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
            .notNull()
            .references(() => sessionQuestions.id, {
                onDelete: "cascade",
            }),

        recordingUrl: text("recording_url"),

        transcript: text("transcript"),

        transcriptionStatus: text(
            "transcription_status"
        )
            .notNull()
            .default("pending"),

        durationSeconds: integer(
            "duration_seconds"
        ),

        notes: text("notes"),

        createdAt: timestamp(
            "created_at",
            {
                withTimezone: true,
            }
        )
            .notNull()
            .defaultNow(),
    },

    (table) => ({
        sessionIdx: index(
            "session_answers_session_idx"
        ).on(table.sessionId),
    })
);