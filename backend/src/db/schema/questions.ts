import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { questionSets } from "./questionSets";
import { difficultyEnum, frequencyEnum, questionTypeEnum } from "../enums";

export const questions = pgTable(
    "questions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        questionSetId: uuid("question_set_id")
            .notNull()
            .references(() => questionSets.id, { onDelete: "cascade" }),

        text: text("text").notNull(),

        typeTag: questionTypeEnum("type_tag"),

        difficulty: difficultyEnum("difficulty")
            .notNull()
            .default("3"),

        frequency: frequencyEnum("frequency")
            .notNull()
            .default("common"),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        version: integer("version")
            .notNull()
            .default(1),

        orderIndex: integer("order_index")
            .notNull()
            .default(0),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        setIdx: index("questions_set_idx").on(
            table.questionSetId
        ),
    })
);