import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

import { downloadObject } from "./storageServices";

export const extractDocumentText = async (
    key: string
): Promise<string> => {
    const buffer = await downloadObject(key);

    const extension = key
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension === "pdf") {
        const parser = new PDFParse({
            data: buffer,
        });

        const result = await parser.getText();

        await parser.destroy();

        if (!result.text?.trim()) {
            throw new Error(
                "Could not extract text from PDF"
            );
        }

        return result.text.trim();
    }

    if (extension === "docx") {
        const result =
            await mammoth.extractRawText({
                buffer,
            });

        if (!result.value?.trim()) {
            throw new Error(
                "Could not extract text from DOCX"
            );
        }

        return result.value.trim();
    }

    throw new Error(
        "Unsupported document format. Only PDF and DOCX are supported."
    );
};