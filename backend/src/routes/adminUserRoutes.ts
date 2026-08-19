import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import {
    getAdminUserDetail,
    getAdminUsers,
}
    from "../controllers/adminUserControllers";

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

export default router;