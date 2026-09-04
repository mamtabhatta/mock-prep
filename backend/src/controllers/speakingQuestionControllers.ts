import {
    Response,
    NextFunction,
} from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
    generateSpeakingQuestion,
} from "../services/speakingQuestionServices";

export const getSpeakingQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { sessionId } =
            req.params;

        const question =
            await generateSpeakingQuestion(
                req.user.userId,
                sessionId
            );

        return res.status(200).json({
            success: true,
            message:
                "Speaking question retrieved successfully",
            data: question,
        });
    } catch (error) {
        next(error);
    }
};