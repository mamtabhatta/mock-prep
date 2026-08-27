import { Router } from "express";

import {
    createPrompt,
    getPromptHistory,
    getActivePrompt,
    activatePrompt,
    rollbackPrompt,
} from "../controllers/promptControllers";

import { validate } from "../middlewares/validate";

import {
    promptModuleParamSchema,
    promptIdParamSchema,
} from "../validations/commonValidation";

import { createPromptSchema } from "../validations/promptValidation";

const router = Router();

/**
 * @openapi
 * /prompts:
 *   post:
 *     tags:
 *       - Prompts
 *     summary: Create a new prompt version
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module
 *               - contentText
 *             properties:
 *               module:
 *                 type: string
 *               contentText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prompt version created successfully
 *       400:
 *         description: Invalid request
 */
router.post(
    "/prompts",
    validate({
        body: createPromptSchema,
    }),
    createPrompt
);

/**
 * @openapi
 * /prompts/module/{module}:
 *   get:
 *     tags:
 *       - Prompts
 *     summary: Get prompt version history for a module
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prompt history retrieved successfully
 *       400:
 *         description: Invalid module
 */
router.get(
    "/prompts/module/:module",
    validate({
        params: promptModuleParamSchema,
    }),
    getPromptHistory
);

/**
 * @openapi
 * /prompts/module/{module}/active:
 *   get:
 *     tags:
 *       - Prompts
 *     summary: Get the active prompt for a module
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active prompt retrieved successfully
 *       400:
 *         description: Invalid module
 */
router.get(
    "/prompts/module/:module/active",
    validate({
        params: promptModuleParamSchema,
    }),
    getActivePrompt
);

/**
 * @openapi
 * /prompts/{promptId}/activate:
 *   patch:
 *     tags:
 *       - Prompts
 *     summary: Activate a prompt version
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prompt activated successfully
 *       400:
 *         description: Invalid prompt ID
 */
router.patch(
    "/prompts/:promptId/activate",
    validate({
        params: promptIdParamSchema,
    }),
    activatePrompt
);

/**
 * @openapi
 * /prompts/{promptId}/rollback:
 *   patch:
 *     tags:
 *       - Prompts
 *     summary: Roll back to a previous prompt version
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prompt rolled back successfully
 *       400:
 *         description: Invalid prompt ID
 */
router.patch(
    "/prompts/:promptId/rollback",
    validate({
        params: promptIdParamSchema,
    }),
    rollbackPrompt
);

export default router;