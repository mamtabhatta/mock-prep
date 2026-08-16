import { Router } from "express";

import {
    createSession,
    getUserSessions,
    getSessionById,
} from "../controllers/sessionControllers";

import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createSession);

router.get("/", authenticate, getUserSessions);

router.get("/:sessionId", authenticate, getSessionById);

export default router;