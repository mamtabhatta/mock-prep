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

// Create a new prompt version
router.post(
    "/prompts",
    validate({
        body: createPromptSchema,
    }),
    createPrompt
);

// Get all versions for a module
router.get(
    "/prompts/module/:module",
    validate({
        params: promptModuleParamSchema,
    }),
    getPromptHistory
);

// Get currently active prompt for a module
router.get(
    "/prompts/module/:module/active",
    validate({
        params: promptModuleParamSchema,
    }),
    getActivePrompt
);

// Activate a specific prompt version
router.patch(
    "/prompts/:promptId/activate",
    validate({
        params: promptIdParamSchema,
    }),
    activatePrompt
);

// Roll back to a specific previous prompt version
router.patch(
    "/prompts/:promptId/rollback",
    validate({
        params: promptIdParamSchema,
    }),
    rollbackPrompt
);

export default router;