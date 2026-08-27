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

/**
 * @openapi
 * /sessions:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Create a session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Session created successfully
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags:
 *       - Sessions
 *     summary: List current user's sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    authenticate,
    validate({
        body: createSessionSchema,
    }),
    createSession
);

router.get(
    "/",
    authenticate,
    getUserSessions
);

/**
 * @openapi
 * /sessions/{sessionId}/submit:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Submit a session for AI evaluation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session submitted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       429:
 *         description: AI rate limit or user quota exceeded
 */
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

/**
 * @openapi
 * /sessions/{sessionId}:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get session details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.get(
    "/:sessionId",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    getSessionById
);

/**
 * @openapi
 * /sessions/{sessionId}/answers/{answerId}/playback:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Generate a short-lived answer playback URL
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playback URL generated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Answer not found
 */
router.get(
    "/:sessionId/answers/:answerId/playback",
    authenticate,
    validate({
        params: answerIdParamSchema,
    }),
    getAnswerPlaybackUrl
);

/**
 * @openapi
 * /sessions/{sessionId}:
 *   delete:
 *     tags:
 *       - Sessions
 *     summary: Delete a session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.delete(
    "/:sessionId",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    deleteSession
);

/**
 * @openapi
 * /sessions/{sessionId}/answers:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Upload a session answer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Session answer uploaded successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
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