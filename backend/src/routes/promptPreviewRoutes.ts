import { Router } from "express";

import { previewPrompt } from "../controllers/promptPreviewControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { aiRateLimiter } from "../middlewares/aiRateLimitMiddleware";
import { aiUserQuota } from "../middlewares/aiQuotaMiddleware";
import { validate } from "../middlewares/validate";
import { previewPromptSchema } from "../validations/promptValidation";

const router = Router();

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