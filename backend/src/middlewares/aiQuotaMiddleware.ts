import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

const userQuota = new Map<
    string,
    {
        count: number;
        resetAt: number;
    }
>();

const QUOTA_LIMIT = 30;
const QUOTA_WINDOW_MS = 60 * 60 * 1000; 

export const aiUserQuota = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }

    const now = Date.now();
    const existing = userQuota.get(userId);

    // First request or quota window expired
    if (!existing || now >= existing.resetAt) {
        userQuota.set(userId, {
            count: 1,
            resetAt: now + QUOTA_WINDOW_MS,
        });

        return next();
    }

    // User exceeded hourly quota
    if (existing.count >= QUOTA_LIMIT) {
        const retryAfter = Math.ceil(
            (existing.resetAt - now) / 1000
        );

        res.setHeader(
            "Retry-After",
            retryAfter.toString()
        );

        return res.status(429).json({
            success: false,
            error: "AI usage quota exceeded. Please try again later.",
            retryAfter,
        });
    }

    existing.count += 1;

    next();
};