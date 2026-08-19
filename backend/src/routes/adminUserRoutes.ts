import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import {
    getAdminUserDetail,
    getAdminUsers,
    updateAdminUserRole,
    updateAdminUserSuspension,
} from "../controllers/adminUserControllers";

const router = Router();

router.get(
    "/users",
    authenticate,
    authorize("super_admin"),
    getAdminUsers
);
router.get(
    "/users/:userId",
    authenticate,
    authorize("super_admin"),
    getAdminUserDetail
);
router.patch(
    "/users/:userId/role",
    authenticate,
    authorize("super_admin"),
    updateAdminUserRole
);

router.patch(
    "/users/:userId/suspension",
    authenticate,
    authorize("super_admin"),
    updateAdminUserSuspension
);

export default router;