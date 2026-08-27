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

/**
 * @openapi
 * /courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - universityId
 *               - name
 *             properties:
 *               universityId:
 *                 type: string
 *               name:
 *                 type: string
 *               track:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    "/courses",
    authenticate,
    authorize("super_admin"),
    validate({
        body: createCourseSchema,
    }),
    createCourse
);

/**
 * @openapi
 * /courses/{courseId}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get(
    "/courses/:courseId",
    authenticate,
    validate({
        params: courseIdParamSchema,
    }),
    getCourse
);

/**
 * @openapi
 * /courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get all courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    "/courses",
    authenticate,
    authorize("super_admin"),
    getAllCourses
);

/**
 * @openapi
 * /courses/{courseId}:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Update a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               track:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
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

/**
 * @openapi
 * /courses/{courseId}/deactivate:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Deactivate a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
router.patch(
    "/courses/:courseId/deactivate",
    authenticate,
    authorize("super_admin"),
    validate({
        params: courseIdParamSchema,
    }),
    deactivateCourse
);

/**
 * @openapi
 * /courses/{courseId}:
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
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