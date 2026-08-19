import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { getAdminUsers } from "../controllers/adminUserControllers";

const router = Router();

router.get(
    "/users",
    authenticate,
    authorize("super_admin"),
    getAdminUsers
);

export default router;