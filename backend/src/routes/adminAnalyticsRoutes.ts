import { Router } from "express";

import {
    getQualityAnalytics,
    getRetentionAnalytics,
    getUsageAnalytics,
} from "../controllers/adminAnalyticsControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * /admin/analytics/usage:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get usage analytics
 *     description: Returns aggregated usage analytics for the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage analytics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 */
router.get(
    "/usage",
    authenticate,
    authorize("super_admin"),
    getUsageAnalytics
);

/**
 * @swagger
 * /admin/analytics/quality:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get quality analytics
 *     description: Returns aggregated quality analytics for the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quality analytics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 */
router.get(
    "/quality",
    authenticate,
    authorize("super_admin"),
    getQualityAnalytics
);

/**
 * @swagger
 * /admin/analytics/retention:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get retention analytics
 *     description: Returns aggregated retention analytics for the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retention analytics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super admin access required
 */
router.get(
    "/retention",
    authenticate,
    authorize("super_admin"),
    getRetentionAnalytics
);

export default router;