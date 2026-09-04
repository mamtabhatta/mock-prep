import {
    Response,
    NextFunction,
} from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
    uploadDocumentSchema,
} from "../validations/documentValidation";

import * as documentService
    from "../services/documentServices";


// ============================================
// UPLOAD SESSION DOCUMENT
// ============================================

export const uploadSessionDocument = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        // ========================================
        // AUTH
        // ========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        // ========================================
        // FILE
        // ========================================

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Document file is required",
            });
        }


        // ========================================
        // SESSION ID
        // ========================================

        const {
            sessionId,
        } = req.params;


        // ========================================
        // VALIDATE BODY
        // ========================================

        const data =
            uploadDocumentSchema.parse(
                req.body
            );


        // ========================================
        // UPLOAD DOCUMENT
        // ========================================

        const result =
            await documentService.uploadSessionDocument(
                req.user.userId,
                sessionId,
                req.file.buffer,
                req.file.mimetype,
                req.file.originalname,
                data.documentType
            );


        // ========================================
        // RESPONSE
        // ========================================

        return res.status(201).json({
            success: true,
            message:
                "Document uploaded successfully",
            data: result,
        });

    } catch (error) {
        next(error);
    }
};