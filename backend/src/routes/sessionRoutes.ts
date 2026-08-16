import { Router } from "express";
import multer from "multer";

import {
    createSession,
    getUserSessions,
    getSessionById,
    createSessionAnswer,
} from "../controllers/sessionControllers";

import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/", authenticate, createSession);

router.get("/", authenticate, getUserSessions);

router.get("/:sessionId", authenticate, getSessionById);

router.post(
    "/:sessionId/answers",
    authenticate,
    upload.single("audio"),
    createSessionAnswer
);

export default router;