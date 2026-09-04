import {
    Response,
    NextFunction,
} from "express";

import {
    AuthRequest,
} from "../middlewares/authMiddleware";

import {
    generateNextInterviewQuestion,
} from "../services/interviewQuestionServices";


// ============================================
// GET NEXT INTERVIEW QUESTION
// ============================================

export const getNextInterviewQuestion =
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {

            // ========================================
            // AUTHENTICATION
            // ========================================

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }


            // ========================================
            // SESSION ID
            // ========================================

            const {
                sessionId,
            } = req.params;


            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Session ID is required",
                });
            }


            // ========================================
            // GENERATE QUESTION
            // ========================================

            /*
            The service will now:
            1. Get the session
            2. Read interviewFormat
            3. Generate format-specific question
            */

            const result =
                await generateNextInterviewQuestion(
                    req.user.userId,
                    sessionId
                );


            // ========================================
            // RESPONSE
            // ========================================

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