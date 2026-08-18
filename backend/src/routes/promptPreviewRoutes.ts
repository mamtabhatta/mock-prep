import { Router } from "express";
import { previewPrompt } from "../controllers/promptPreviewControllers";

const router = Router();

router.post("/prompts/preview", previewPrompt);

export default router;