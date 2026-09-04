import { z } from "zod";

// ============================================
// CREATE SESSION
// ============================================

export const createSessionSchema = z.object({
    module: z.enum([
        "interview",
        "speaking",
        "writing",
        "listening",
    ]),

    universityId: z
        .string()
        .uuid()
        .optional()
        .nullable(),

    courseId: z
        .string()
        .uuid()
        .optional()
        .nullable(),

    questionSetId: z
        .string()
        .uuid()
        .optional()
        .nullable(),

    /*
    |--------------------------------------------------------------------------
    | INTERVIEW FORMAT
    |--------------------------------------------------------------------------
    */

    interviewFormat: z
        .enum([
            "Panel",
            "1-on-1",
            "MMI",
        ])
        .optional()
        .nullable(),
});


// ============================================
// CREATE SESSION ANSWER
// ============================================

export const createSessionAnswerSchema = z.object({
    questionId: z
        .string()
        .uuid(),

    durationSeconds: z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),
});


// ============================================
// TYPES
// ============================================

export type CreateSessionInput =
    z.infer<typeof createSessionSchema>;

export type CreateSessionAnswerInput =
    z.infer<typeof createSessionAnswerSchema>;