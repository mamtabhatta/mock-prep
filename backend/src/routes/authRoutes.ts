import { Router } from "express";
import {
    register,
    login,
    refresh,
} from "../controllers/authControllers";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refresh);

router.get("/me", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated",
        user: (req as any).user,
    });
});

export default router;