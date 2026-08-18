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
    getUniversity
);

router.patch(
    "/universities/:universityId",
    authenticate,
    authorize("super_admin"),
    updateUniversity
);

router.patch(
    "/universities/:universityId/deactivate",
    authenticate,
    authorize("super_admin"),
    deactivateUniversity
);

router.delete(
    "/universities/:universityId",
    authenticate,
    authorize("super_admin"),
    deleteUniversity
);

export default router;