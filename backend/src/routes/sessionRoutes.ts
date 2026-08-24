import { Router } from "express";
import multer from "multer";

import {
    createSession,
    getUserSessions,
    getSessionById,
    createSessionAnswer,
    submitSession,
    deleteSession,
    getAnswerPlaybackUrl,
} from "../controllers/sessionControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { aiRateLimiter } from "../middlewares/aiRateLimitMiddleware";
import { aiUserQuota } from "../middlewares/aiQuotaMiddleware";

const router = Router();

const upload = multer();

// Create session
router.post(
    "/",
    authenticate,
    createSession
);

// List current user's sessions
router.get(
    "/",
    authenticate,
    getUserSessions
);

// Submit session
router.post(
    "/:sessionId/submit",
    authenticate,
    aiRateLimiter,
    aiUserQuota,
    submitSession
);

// Get session detail
router.get(
    "/:sessionId",
    authenticate,
    getSessionById
);
// Generate short-lived answer playback URL
router.get(
    "/:sessionId/answers/:answerId/playback",
    authenticate,
    getAnswerPlaybackUrl
);

// Delete session
router.delete(
    "/:sessionId",
    authenticate,
    deleteSession
);

// Upload session answer
router.post(
    "/:sessionId/answers",
    authenticate,
    upload.single("audio"),
    createSessionAnswer
);

export default router;