import { Router } from "express";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import {
    getAdminUserDetail,
    getAdminUsers,
    updateAdminUserRole,
    updateAdminUserSuspension,
} from "../controllers/adminUserControllers";

import { validate } from "../middlewares/validate";

import {
    userIdParamSchema,
} from "../validations/commonValidation";

import {
    updateUserRoleSchema,
    updateUserSuspensionSchema,
} from "../validations/authValidation";

const router = Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin Users
 *     summary: Get all users
 *     description: Returns a list of users for super admin management.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 */
router.get(
    "/users",
    authenticate,
    authorize("super_admin"),
    getAdminUsers
);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     tags:
 *       - Admin Users
 *     summary: Get user details
 *     description: Returns details of a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 *       404:
 *         description: User not found
 */
router.get(
    "/users/:userId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: userIdParamSchema,
    }),
    getAdminUserDetail
);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     tags:
 *       - Admin Users
 *     summary: Update user role
 *     description: Updates the role of a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - student
 *                   - counselor
 *                   - super_admin
 *                 example: counselor
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 *       404:
 *         description: User not found
 */
router.patch(
    "/users/:userId/role",
    authenticate,
    authorize("super_admin"),
    validate({
        params: userIdParamSchema,
        body: updateUserRoleSchema,
    }),
    updateAdminUserRole
);

/**
 * @swagger
 * /admin/users/{userId}/suspension:
 *   patch:
 *     tags:
 *       - Admin Users
 *     summary: Update user suspension status
 *     description: Suspends or unsuspends a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isSuspended:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User suspension status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 *       404:
 *         description: User not found
 */
router.patch(
    "/users/:userId/suspension",
    authenticate,
    authorize("super_admin"),
    validate({
        params: userIdParamSchema,
        body: updateUserSuspensionSchema,
    }),
    updateAdminUserSuspension
);

export default router;