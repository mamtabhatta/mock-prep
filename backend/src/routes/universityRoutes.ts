import { Router } from "express";

import {
    createUniversity,
    getUniversity,
    updateUniversity,
    deactivateUniversity,
    deleteUniversity,
} from "../controllers/universityControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";
import {
    universityIdParamSchema,
} from "../validations/commonValidation";

const router = Router();

router.post(
    "/universities",
    authenticate,
    authorize("super_admin"),
    createUniversity
);

router.get(
    "/universities/:universityId",
    authenticate,
    validate({
        params: universityIdParamSchema,
    }),
    getUniversity
);

router.patch(
    "/universities/:universityId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: universityIdParamSchema,
    }),
    updateUniversity
);

router.patch(
    "/universities/:universityId/deactivate",
    authenticate,
    authorize("super_admin"),
    validate({
        params: universityIdParamSchema,
    }),
    deactivateUniversity
);

router.delete(
    "/universities/:universityId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: universityIdParamSchema,
    }),
    deleteUniversity
);

export default router;