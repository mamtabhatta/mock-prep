import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
    presignDocumentSchema,
    updateProfileDocumentSchema
} from "../validations/profileValidation";
import { generatePresignedPutUrl } from "../services/storageServices";
import prisma from "../config/db";

export const getDocumentPresignedUrl = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { kind, contentType } = presignDocumentSchema.parse(req.body);

        const fileExtension = contentType.split("/")[1] || "pdf";
        const key = `profiles/${userId}/${kind}-${Date.now()}.${fileExtension}`;

        const uploadUrl = await generatePresignedPutUrl(key, contentType);

        return res.status(200).json({
            success: true,
            uploadUrl,
            key,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfileDocument = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { kind, key } = updateProfileDocumentSchema.parse(req.body);

        // Maps 'cv' -> 'cv_file_url', 'transcript' -> 'transcript_file_url', etc.
        const fieldToUpdate = `${kind}_file_url`;

        const updatedProfile = await prisma.profiles.upsert({
            where: { user_id: userId },
            update: { [fieldToUpdate]: key },
            create: {
                user_id: userId,
                [fieldToUpdate]: key,
            },
        });

        return res.status(200).json({
            success: true,
            message: `${kind.toUpperCase()} saved to database profile successfully`,
            data: updatedProfile,
        });
    } catch (error) {
        next(error);
    }
};