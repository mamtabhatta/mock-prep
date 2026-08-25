import { z } from "zod";

export const createCourseSchema = z.object({
    universityId: z.string().uuid(),
    name: z.string().min(1).max(255),
    track: z.enum(["admission", "visa"]).optional(),
    interviewFormat: z
        .enum([
            "mmi",
            "panel",
            "portfolio",
            "one_on_one",
            "none",
        ])
        .optional(),
    durationMins: z.number().int().positive().optional(),
    panelSize: z.number().int().positive().optional(),
    studentContext: z.string().optional(),
    adminNotes: z.string().optional(),
});

export const updateCourseSchema = z.object({
    universityId: z.string().uuid().optional(),
    name: z.string().min(1).max(255).optional(),
    track: z.enum(["admission", "visa"]).optional(),
    interviewFormat: z
        .enum([
            "mmi",
            "panel",
            "portfolio",
            "one_on_one",
            "none",
        ])
        .optional(),
    durationMins: z.number().int().positive().optional(),
    panelSize: z.number().int().positive().optional(),
    studentContext: z.string().optional(),
    adminNotes: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;