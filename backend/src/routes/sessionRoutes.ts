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
import { validate } from "../middlewares/validate";

import {
    createSessionSchema,
    createSessionAnswerSchema,
} from "../validations/sessionValidation";

import {
    sessionIdParamSchema,
    answerIdParamSchema,
} from "../validations/commonValidation";

import { aiRateLimiter } from "../middlewares/aiRateLimitMiddleware";
import { aiUserQuota } from "../middlewares/aiQuotaMiddleware";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

// Create session
router.post(
    "/",
    authenticate,
    validate({
        body: createSessionSchema,
    }),
    createSession
);

// List current user's sessions
router.get(
    "/",
    authenticate,
    getUserSessions
);

// Submit session — AI endpoint
router.post(
    "/:sessionId/submit",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    aiRateLimiter,
    aiUserQuota,
    submitSession
);

// Get session detail
router.get(
    "/:sessionId",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    getSessionById
);

// Generate short-lived answer playback URL
router.get(
    "/:sessionId/answers/:answerId/playback",
    authenticate,
    validate({
        params: answerIdParamSchema,
    }),
    getAnswerPlaybackUrl
);

// Delete session
router.delete(
    "/:sessionId",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    deleteSession
);

// Upload session answer
router.post(
    "/:sessionId/answers",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    upload.single("audio"),
    validate({
        body: createSessionAnswerSchema,
    }),
    createSessionAnswer
);

export default router;