import { Router } from "express";

import { previewPrompt } from "../controllers/promptPreviewControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { aiRateLimiter } from "../middlewares/aiRateLimitMiddleware";
import { aiUserQuota } from "../middlewares/aiQuotaMiddleware";
import { validate } from "../middlewares/validate";
import { previewPromptSchema } from "../validations/promptValidation";

const router = Router();

/**
 * @openapi
 * /prompts/preview:
 *   post:
 *     tags:
 *       - Prompts
 *     summary: Preview an AI prompt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module
 *               - transcript
 *             properties:
 *               module:
 *                 type: string
 *               transcript:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI prompt preview generated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit or quota exceeded
 */
router.post(
    "/prompts/preview",
    authenticate,
    validate({
        body: previewPromptSchema,
    }),
    aiRateLimiter,
    aiUserQuota,
    previewPrompt
);

export default router;