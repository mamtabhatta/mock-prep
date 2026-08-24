import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, 
    limit: 10, 
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many AI requests. Please try again later.",
    },
});