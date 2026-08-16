import { z } from "zod";

export const createSessionSchema = z.object({
    module: z.enum(["interview", "speaking", "writing", "listening"]),
    universityId: z.string().uuid().optional().nullable(),
    courseId: z.string().uuid().optional().nullable(),
    questionSetId: z.string().uuid().optional().nullable(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;