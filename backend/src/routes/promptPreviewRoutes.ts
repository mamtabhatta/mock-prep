import { Router } from "express";
import { previewPrompt } from "../controllers/promptPreviewControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { aiRateLimiter } from "../middlewares/aiRateLimitMiddleware";
import { aiUserQuota } from "../middlewares/aiQuotaMiddleware";

const router = Router();

router.post(
    "/prompts/preview",
    authenticate,
    aiRateLimiter,
    aiUserQuota,
    previewPrompt
);

export default router;