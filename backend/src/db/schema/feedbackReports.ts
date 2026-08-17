import {
    index,
    jsonb,
    pgTable,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { sessions } from "./sessions";
import { users } from "./users";

import { reportStatusEnum } from "../enums";

export const feedbackReports = pgTable(
    "feedback_reports",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        sessionId: uuid("session_id")
            .notNull()
            .unique()
            .references(() => sessions.id, {
                onDelete: "cascade",
            }),

        quickSnapshotJson: jsonb("quick_snapshot_json"),

        deepReportJson: jsonb("deep_report_json"),

        scoresJson: jsonb("scores_json"),

        aiFeedbackJson: jsonb("ai_feedback_json"),

        counselorFeedbackJson: jsonb("counselor_feedback_json"),

        reviewedBy: uuid("reviewed_by")
            .references(() => users.id),

        status: reportStatusEnum("status")
            .notNull()
            .default("ai_reviewed"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        sessionIdx: index("feedback_reports_session_idx").on(
            table.sessionId
        ),
    })
);