import { z } from "zod";

export const createQuestionSetSchema = z.object({
    courseId: z.string().uuid(),
    name: z.string().trim().min(1),
    description: z.string().optional().nullable(),
});

export const updateQuestionSetSchema = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});

export const reorderQuestionsSchema = z.object({
    questionIds: z
        .array(z.string().uuid())
        .min(1),
});

export type CreateQuestionSetInput =
    z.infer<typeof createQuestionSetSchema>;

export type UpdateQuestionSetInput =
    z.infer<typeof updateQuestionSetSchema>;

export type ReorderQuestionsInput =
    z.infer<typeof reorderQuestionsSchema>;