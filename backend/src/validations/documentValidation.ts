import { z } from "zod";

export const uploadDocumentSchema = z.object({
    documentType: z
        .enum([
            "cv",
            "personal_statement",
            "other",
        ])
        .default("cv"),
});

export type UploadDocumentInput =
    z.infer<typeof uploadDocumentSchema>;