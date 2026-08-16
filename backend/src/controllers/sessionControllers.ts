import {
    Response,
    NextFunction,
} from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
    createSessionSchema,
    createSessionAnswerSchema,
} from "../validations/sessionValidation";

import * as sessionService
    from "../services/sessionServices";


// ============================================
// CREATE SESSION
// ============================================

export const createSession = async (
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

        const data =
            createSessionSchema.parse(
                req.body
            );

        const session =
            await sessionService.createSession(
                req.user.userId,
                data
            );

        return res.status(201).json({
            success: true,
            message:
                "Session created successfully",
            data: session,
        });

    } catch (error) {
        next(error);
    }
};


// ============================================
// GET USER SESSIONS
// ============================================

export const getUserSessions = async (
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

        const sessions =
            await sessionService.getUserSessions(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Sessions retrieved successfully",
            data: sessions,
        });

    } catch (error) {
        next(error);
    }
};


// ============================================
// GET SESSION DETAIL
// ============================================

export const getSessionById = async (
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

        const session =
            await sessionService.getSessionById(
                req.user.userId,
                sessionId
            );

        return res.status(200).json({
            success: true,
            message:
                "Session retrieved successfully",
            data: session,
        });

    } catch (error) {
        next(error);
    }
};


// ============================================
// CREATE SESSION ANSWER
// ============================================

export const createSessionAnswer = async (
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

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Audio file is required",
            });
        }

        const { sessionId } =
            req.params;

        const data =
            createSessionAnswerSchema.parse(
                req.body
            );

        const answer =
            await sessionService.createSessionAnswer(
                req.user.userId,
                sessionId,
                data.questionId,
                req.file.buffer,
                req.file.mimetype,
                data.durationSeconds
            );

        return res.status(201).json({
            success: true,
            message:
                "Answer uploaded successfully",
            data: answer,
        });

    } catch (error) {
        next(error);
    }
};


// ============================================
// SUBMIT SESSION
// ============================================

export const submitSession = async (
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

        const session =
            await sessionService.submitSession(
                req.user.userId,
                sessionId
            );

        return res.status(200).json({
            success: true,
            message:
                "Session submitted successfully",
            data: session,
        });

    } catch (error) {
        next(error);
    }
};


// ============================================
// DELETE SESSION
// ============================================

export const deleteSession = async (
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

        const result =
            await sessionService.deleteSession(
                req.user.userId,
                sessionId
            );

        return res.status(200).json({
            success: true,
            message:
                "Session deleted successfully",
            data: result,
        });

    } catch (error) {
        next(error);
    }
};