import { Router } from "express";
import {
    register,
    login,
    refresh,
    forgotPassword,
    resetPassword,
    verifyEmail
} from "../controllers/authControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refresh);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);

router.get("/me", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated",
        user: (req as any).user,
    });
});
router.get(
    "/student",
    authenticate,
    authorize("student"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Student",
        });
    }
);

router.get(
    "/counselor",
    authenticate,
    authorize("counselor"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Counselor",
        });
    }
);

router.get(
    "/admin",
    authenticate,
    authorize("super_admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Super Admin",
        });
    }
);

export default router;