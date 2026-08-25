import { z } from "zod";

export const uuidParamSchema = z.object({
    id: z.string().uuid(),
});

export const userIdParamSchema = z.object({
    userId: z.string().uuid(),
});

export const universityIdParamSchema = z.object({
    universityId: z.string().uuid(),
});

export const courseIdParamSchema = z.object({
    courseId: z.string().uuid(),
});

export const questionSetIdParamSchema = z.object({
    setId: z.string().uuid(),
});

export const questionIdParamSchema = z.object({
    questionId: z.string().uuid(),
});

export const sessionIdParamSchema = z.object({
    sessionId: z.string().uuid(),
});

export const answerIdParamSchema = z.object({
    sessionId: z.string().uuid(),
    answerId: z.string().uuid(),
});

export const promptIdParamSchema = z.object({
    promptId: z.string().uuid(),
});

export const promptModuleParamSchema = z.object({
    module: z.enum([
        "interview_feedback",
        "ielts_speaking",
        "ielts_writing",
        "ielts_listening_summary",
    ]),
});