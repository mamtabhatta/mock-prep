import { Router } from "express";

import {
    getQualityAnalytics,
    getRetentionAnalytics,
    getUsageAnalytics,
} from "../controllers/adminAnalyticsControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
    "/usage",
    authenticate,
    authorize("super_admin"),
    getUsageAnalytics
);

router.get(
    "/quality",
    authenticate,
    authorize("super_admin"),
    getQualityAnalytics
);

router.get(
    "/retention",
    authenticate,
    authorize("super_admin"),
    getRetentionAnalytics
);

export default router;