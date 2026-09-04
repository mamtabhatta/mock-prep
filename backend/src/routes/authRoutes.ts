import { Router } from "express";

import {
    register,
    login,
    refresh,
    forgotPassword,
    resetPassword,
    verifyEmail,
    googleLogin,
    googleCallback,
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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post(
    "/register",
    validate({ body: registerSchema }),
    register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login
 *     description: Authenticates a user and returns authentication tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post(
    "/login",
    validate({ body: loginSchema }),
    login
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Generates a new access token using a refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
    "/refresh",
    validate({ body: refreshTokenSchema }),
    refresh
);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Sends a password reset request for the specified email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed successfully
 *       400:
 *         description: Validation error
 */
router.post(
    "/forgot-password",
    validate({ body: forgotPasswordSchema }),
    forgotPassword
);

/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Start Google OAuth login
 *     description: Redirects the user to Google for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth authorization page
 */
router.get(
    "/google",
    googleLogin
);

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google after successful authentication.
 *     responses:
 *       302:
 *         description: Authentication completed and user redirected
 *       400:
 *         description: Google authentication failed
 */
router.get(
    "/google/callback",
    googleCallback
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Resets a user's password using a valid reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: reset-token
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error or invalid token
 */
router.post(
    "/reset-password",
    validate({ body: resetPasswordSchema }),
    resetPassword
);

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify email address
 *     description: Verifies a user's email address using a verification token.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification token
 */
router.get(
    "/verify-email",
    validate({ query: verifyEmailSchema }),
    verifyEmail
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get authenticated user
 *     description: Returns the currently authenticated user's information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user returned successfully
 *       401:
 *         description: Authentication required
 */
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

/**
 * @openapi
 * /auth/student:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Student-only endpoint
 *     description: Accessible only to authenticated students.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student access granted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required
 */
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

/**
 * @openapi
 * /auth/counselor:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Counselor-only endpoint
 *     description: Accessible only to authenticated counselors.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Counselor access granted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Counselor role required
 */
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

/**
 * @openapi
 * /auth/admin:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Super admin-only endpoint
 *     description: Accessible only to authenticated super administrators.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Super admin access granted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin role required
 */
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