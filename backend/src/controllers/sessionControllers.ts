import { Response, NextFunction } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";
import { createSessionSchema } from "../validations/sessionValidation";
import * as sessionService from "../services/sessionServices";

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

        const data = createSessionSchema.parse(req.body);

        const session = await sessionService.createSession(
            req.user.userId,
            data
        );

        return res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: session,
        });
    } catch (error) {
        next(error);
    }
};

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

        const sessions = await sessionService.getUserSessions(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Sessions retrieved successfully",
            data: sessions,
        });
    } catch (error) {
        next(error);
    }
};
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

        const { sessionId } = req.params;

        const session = await sessionService.getSessionById(
            req.user.userId,
            sessionId
        );

        return res.status(200).json({
            success: true,
            message: "Session retrieved successfully",
            data: session,
        });
    } catch (error) {
        next(error);
    }
};