import { z } from "zod";

export const createQuestionSchema = z.object({
    questionSetId: z.string().uuid(),
    text: z.string().trim().min(1),
    typeTag: z.string().optional(),
    difficulty: z.string().optional(),
    frequency: z.number().int().nonnegative().optional(),
    orderIndex: z.number().int().nonnegative().optional(),
});

export const updateQuestionSchema = z.object({
    questionSetId: z.string().uuid().optional(),
    text: z.string().trim().min(1).optional(),
    typeTag: z.string().optional(),
    difficulty: z.string().optional(),
    frequency: z.number().int().nonnegative().optional(),
    orderIndex: z.number().int().nonnegative().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;