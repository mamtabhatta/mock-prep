import crypto from "crypto";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { and, eq } from "drizzle-orm";

import { db } from "../db";

import {
    sessions,
    profiles,
} from "../db/schema";

import {
    uploadAudio,
    downloadObject,
} from "./storageServices";


// ============================================
// UPLOAD SESSION DOCUMENT
// ============================================

export const uploadSessionDocument = async (
    userId: string,
    sessionId: string,
    fileBuffer: Buffer,
    contentType: string,
    originalName: string,
    documentType: string
) => {

    // ========================================
    // 1. CHECK SESSION OWNERSHIP
    // ========================================

    const [session] =
        await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(
                        sessions.id,
                        sessionId
                    ),
                    eq(
                        sessions.userId,
                        userId
                    )
                )
            )
            .limit(1);

    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    // ========================================
    // 2. ONLY CV FOR NOW
    // ========================================

    if (documentType !== "cv") {
        throw new Error(
            "Only CV documents are supported"
        );
    }


    // ========================================
    // 3. VALIDATE FILE TYPE
    // ========================================

    const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
        !allowedMimeTypes.includes(
            contentType
        )
    ) {
        throw new Error(
            "Invalid CV format. Only PDF and DOCX files are supported."
        );
    }


    // ========================================
    // 4. GET FILE EXTENSION
    // ========================================

    const extension =
        originalName
            .split(".")
            .pop()
            ?.toLowerCase();


    if (
        extension !== "pdf" &&
        extension !== "docx"
    ) {
        throw new Error(
            "Invalid CV extension. Only PDF and DOCX files are supported."
        );
    }


    // ========================================
    // 5. GENERATE STORAGE KEY
    // ========================================

    const key =
        `sessions/${sessionId}/documents/cv-${crypto.randomUUID()}.${extension}`;


    // ========================================
    // 6. UPLOAD TO MINIO
    // ========================================

    await uploadAudio(
        key,
        fileBuffer,
        contentType
    );


    // ========================================
    // 7. FIND USER PROFILE
    // ========================================

    const [profile] =
        await db
            .select()
            .from(profiles)
            .where(
                eq(
                    profiles.userId,
                    userId
                )
            )
            .limit(1);


    // ========================================
    // 8. SAVE CV STORAGE KEY
    // ========================================

    if (profile) {

        await db
            .update(profiles)
            .set({
                cvFileUrl: key,
            })
            .where(
                eq(
                    profiles.userId,
                    userId
                )
            );

    } else {

        await db
            .insert(profiles)
            .values({
                userId,
                cvFileUrl: key,
            });

    }


    // ========================================
    // 9. RETURN RESULT
    // ========================================

    return {
        sessionId,

        documentType,

        key,

        originalName,

        contentType,

        size:
            fileBuffer.length,
    };
};


// ============================================
// EXTRACT DOCUMENT TEXT
// ============================================

export const extractDocumentText = async (
    key: string
): Promise<string> => {

    // ========================================
    // DOWNLOAD FROM MINIO
    // ========================================

    const buffer =
        await downloadObject(key);


    // ========================================
    // GET EXTENSION
    // ========================================

    const extension =
        key
            .split(".")
            .pop()
            ?.toLowerCase();


    // ========================================
    // PDF
    // ========================================

    if (extension === "pdf") {

        const parser =
            new PDFParse({
                data: buffer,
            });

        try {

            const result =
                await parser.getText();

            if (
                !result.text?.trim()
            ) {
                throw new Error(
                    "Could not extract text from PDF"
                );
            }

            return result.text.trim();

        } finally {

            await parser.destroy();

        }
    }


    // ========================================
    // DOCX
    // ========================================

    if (extension === "docx") {

        const result =
            await mammoth.extractRawText({
                buffer,
            });

        if (
            !result.value?.trim()
        ) {
            throw new Error(
                "Could not extract text from DOCX"
            );
        }

        return result.value.trim();
    }


    // ========================================
    // UNSUPPORTED
    // ========================================

    throw new Error(
        "Unsupported document format. Only PDF and DOCX are supported."
    );
};