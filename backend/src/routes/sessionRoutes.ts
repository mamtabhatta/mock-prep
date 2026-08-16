import { Router } from "express";

import {
    createSession,
    getUserSessions,
} from "../controllers/sessionControllers"

import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createSession);
router.get("/", authenticate, getUserSessions);

export default router;