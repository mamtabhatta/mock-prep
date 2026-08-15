import { z } from "zod";

export const presignDocumentSchema = z.object({
    kind: z.enum(["cv", "transcript", "sop"]),
    contentType: z.string().min(1, "contentType is required"),
});

export type PresignDocumentInput = z.infer<typeof presignDocumentSchema>;


export const updateProfileDocumentSchema = z.object({
    kind: z.enum(["cv", "transcript", "sop"]),
    key: z.string().min(1, "Document key is required"),
});

export type UpdateProfileDocumentInput = z.infer<typeof updateProfileDocumentSchema>;