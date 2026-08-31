import {
    Response,
    NextFunction,
} from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
    generateNextInterviewQuestion,
} from "../services/interviewQuestionServices";

export const getNextInterviewQuestion = async (
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

        const { sessionId } = req.params;

        const result =
            await generateNextInterviewQuestion(
                req.user.userId,
                sessionId
            );

        return res.status(200).json({
            success: true,
            message:
                "Next interview question generated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};