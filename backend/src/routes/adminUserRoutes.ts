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
    // reuse these if already exported from authValidation
} from "../validations/commonValidation";

import {
    updateUserRoleSchema,
    updateUserSuspensionSchema,
} from "../validations/authValidation";

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
    validate({
        params: userIdParamSchema,
    }),
    getAdminUserDetail
);

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