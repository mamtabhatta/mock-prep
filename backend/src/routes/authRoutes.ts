import { Router } from "express";

import {
    register,
    login,
    refresh,
    forgotPassword,
    resetPassword,
    verifyEmail,
} from "../controllers/authControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";

import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "../validations/authValidation";

const router = Router();

router.post(
    "/register",
    validate({ body: registerSchema }),
    register
);

router.post(
    "/login",
    validate({ body: loginSchema }),
    login
);

router.post(
    "/refresh",
    validate({ body: refreshTokenSchema }),
    refresh
);

router.post(
    "/forgot-password",
    validate({ body: forgotPasswordSchema }),
    forgotPassword
);

router.post(
    "/reset-password",
    validate({ body: resetPasswordSchema }),
    resetPassword
);

router.get(
    "/verify-email",
    validate({ query: verifyEmailSchema }),
    verifyEmail
);

router.get(
    "/me",
    authenticate,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Authenticated",
            user: (req as any).user,
        });
    }
);

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