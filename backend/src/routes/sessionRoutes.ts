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

import {
    getSpeakingQuestion,
} from "../controllers/speakingQuestionControllers";

import {
    uploadSessionDocument,
} from "../controllers/documentControllers";

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

import {
    getNextInterviewQuestion,
} from "../controllers/interviewQuestionControllers";

const router = Router();

/*
|--------------------------------------------------------------------------
| MULTER
|--------------------------------------------------------------------------
*/

const upload = multer({
    storage: multer.memoryStorage(),
});


/**
 * @openapi
 * /sessions:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Create a new interview session
 *     description: Creates a new interview practice session for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Interview session created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    authenticate,
    validate({
        body: createSessionSchema,
    }),
    createSession
);


/**
 * @openapi
 * /sessions:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get all user sessions
 *     description: Retrieves all interview sessions belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    authenticate,
    getUserSessions
);


/**
 * @openapi
 * /sessions/{sessionId}/documents:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Upload a document to a session
 *     description: Uploads a document associated with an interview session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid session ID or file
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:sessionId/documents",
    authenticate,
    upload.single("file"),
    validate({
        params: sessionIdParamSchema,
    }),
    uploadSessionDocument
);


/**
 * @openapi
 * /sessions/{sessionId}/submit:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Submit an interview session
 *     description: Submits an interview session for processing and AI feedback generation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session submitted successfully
 *       400:
 *         description: Session cannot be submitted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       429:
 *         description: AI rate limit or user quota exceeded
 *       500:
 *         description: Internal server error
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
 *     summary: Get a session by ID
 *     description: Retrieves a specific interview session belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *       400:
 *         description: Invalid session ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
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
 *     summary: Get answer playback URL
 *     description: Generates a playback URL for an audio answer belonging to an interview session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: answerId
 *         required: true
 *         description: ID of the session answer
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Playback URL generated successfully
 *       400:
 *         description: Invalid session ID or answer ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session or answer not found
 *       500:
 *         description: Internal server error
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
 *     summary: Delete an interview session
 *     description: Permanently deletes an interview session belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       400:
 *         description: Invalid session ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       - 500:
 *         description: Internal server error
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
 *       - Session Answers
 *     summary: Submit an answer
 *     description: Uploads an audio recording as an answer to an interview question.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio recording of the user's answer
 *     responses:
 *       201:
 *         description: Answer created successfully
 *       400:
 *         description: Invalid request or audio file
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:sessionId/answers",
    authenticate,
    upload.single("audio"),
    validate({
        params: sessionIdParamSchema,
    }),
    validate({
        body: createSessionAnswerSchema,
    }),
    createSessionAnswer
);


/**
 * @openapi
 * /sessions/{sessionId}/speaking-question:
 *   post:
 *     tags:
 *       - AI Interview
 *     summary: Generate a speaking question
 *     description: Generates an AI-powered speaking question for the current interview session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Speaking question generated successfully
 *       400:
 *         description: Invalid session ID or session state
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       429:
 *         description: AI rate limit or user quota exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:sessionId/speaking-question",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    aiRateLimiter,
    aiUserQuota,
    getSpeakingQuestion
);


/**
 * @openapi
 * /sessions/{sessionId}/next-question:
 *   post:
 *     tags:
 *       - AI Interview
 *     summary: Generate the next interview question
 *     description: Generates the next AI-powered interview question based on the current interview session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the interview session
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Next interview question generated successfully
 *       400:
 *         description: Invalid session ID or session state
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       429:
 *         description: AI rate limit or user quota exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:sessionId/next-question",
    authenticate,
    validate({
        params: sessionIdParamSchema,
    }),
    aiRateLimiter,
    aiUserQuota,
    getNextInterviewQuestion
);


export default router;