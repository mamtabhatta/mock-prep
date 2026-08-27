import { Router } from "express";

import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import {
    getProfile,
    updateProfile,
} from "../controllers/userControllers";
import { updateProfileSchema } from "../validations/authValidation";

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/me",
    authenticate,
    getProfile
);

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.put(
    "/me",
    authenticate,
    validate({
        body: updateProfileSchema,
    }),
    updateProfile
);

export default router;