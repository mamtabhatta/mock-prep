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
import { validate } from "../middlewares/validate";

import {
    courseIdParamSchema,
} from "../validations/commonValidation";

import {
    createCourseSchema,
    updateCourseSchema,
} from "../validations/courseValidation";

const router = Router();

router.post(
    "/courses",
    authenticate,
    authorize("super_admin"),
    validate({
        body: createCourseSchema,
    }),
    createCourse
);

router.get(
    "/courses/:courseId",
    authenticate,
    validate({
        params: courseIdParamSchema,
    }),
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
    validate({
        params: courseIdParamSchema,
        body: updateCourseSchema,
    }),
    updateCourse
);

router.patch(
    "/courses/:courseId/deactivate",
    authenticate,
    authorize("super_admin"),
    validate({
        params: courseIdParamSchema,
    }),
    deactivateCourse
);

router.delete(
    "/courses/:courseId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: courseIdParamSchema,
    }),
    deleteCourse
);

export default router;