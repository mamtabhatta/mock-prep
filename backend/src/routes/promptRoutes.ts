import { Router } from "express";
import {
    createPrompt,
    getPromptHistory,
    getActivePrompt,
    activatePrompt,
    rollbackPrompt,
} from "../controllers/promptControllers";

const router = Router();

// Create a new prompt version
router.post("/prompts", createPrompt);

// Get all versions for a module
router.get("/prompts/module/:module", getPromptHistory);

// Get currently active prompt for a module
router.get("/prompts/module/:module/active", getActivePrompt);

// Activate a specific prompt version
router.patch("/prompts/:promptId/activate", activatePrompt);

// Roll back to a specific previous version
router.patch("/prompts/:promptId/rollback", rollbackPrompt);

export default router;