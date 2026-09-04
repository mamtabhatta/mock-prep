import {
    index,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { sessions } from "./sessions";

export const sessionDocuments = pgTable(
    "session_documents",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        sessionId: uuid("session_id")
            .notNull()
            .references(() => sessions.id, {
                onDelete: "cascade",
            }),

        documentType: text("document_type")
            .notNull(),

        fileUrl: text("file_url")
            .notNull(),

        extractedText: text(
            "extracted_text"
        ),

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
            "session_documents_session_idx"
        ).on(table.sessionId),
    })
);