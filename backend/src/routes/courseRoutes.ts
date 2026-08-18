import { Router } from "express";
import {
    createCourse,
    getCourse,
    updateCourse,
    deactivateCourse,
        getAllCourses,
    deleteCourse,
} from "../controllers/courseControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.post(
    "/courses",
    authenticate,
    authorize("super_admin"),
    createCourse
);

router.get(
    "/courses/:courseId",
    authenticate,
    getCourse
);
router.get(
    "/courses",
    authenticate,
    authorize("super_admin"),
    getAllCourses
);
router.patch(
    "/courses/:courseId",
    authenticate,
    authorize("super_admin"),
    updateCourse
);

router.patch(
    "/courses/:courseId/deactivate",
    authenticate,
    authorize("super_admin"),
    deactivateCourse
);

router.delete(
    "/courses/:courseId",
    authenticate,
    authorize("super_admin"),
    deleteCourse
);

export default router;