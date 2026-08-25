import { z } from "zod";

export const createPromptSchema = z.object({
    module: z.enum([
        "interview_feedback",
        "ielts_speaking",
        "ielts_writing",
        "ielts_listening_summary",
    ]),
    contentText: z.string().trim().min(1, "Prompt content is required"),
});

export const previewPromptSchema = z.object({
    module: z.enum([
        "interview_feedback",
        "ielts_speaking",
        "ielts_writing",
        "ielts_listening_summary",
    ]),
    transcript: z.string().trim().min(1, "Transcript is required"),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;

export type PreviewPromptInput = z.infer<typeof previewPromptSchema>;