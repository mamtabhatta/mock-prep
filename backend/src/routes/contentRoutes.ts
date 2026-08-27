import { Router } from "express";

import {
    getUniversities,
    getCoursesByUniversity,
    getQuestionSets,
    getQuestions,
} from "../controllers/contentControllers";

import { validate } from "../middlewares/validate";

import {
    universityIdParamSchema,
    courseIdParamSchema,
    questionSetIdParamSchema,
} from "../validations/commonValidation";

const router = Router();

/**
 * @swagger
 * /content/universities:
 *   get:
 *     tags:
 *       - Content
 *     summary: Get universities
 *     description: Returns the available universities.
 *     responses:
 *       200:
 *         description: Universities retrieved successfully
 */
router.get(
    "/universities",
    getUniversities
);

/**
 * @swagger
 * /content/universities/{universityId}/courses:
 *   get:
 *     tags:
 *       - Content
 *     summary: Get courses by university
 *     description: Returns courses belonging to a specific university.
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: string
 *         description: University ID
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       400:
 *         description: Invalid university ID
 *       404:
 *         description: University not found
 */
router.get(
    "/universities/:universityId/courses",
    validate({
        params: universityIdParamSchema,
    }),
    getCoursesByUniversity
);

/**
 * @swagger
 * /content/courses/{courseId}/question-sets:
 *   get:
 *     tags:
 *       - Content
 *     summary: Get question sets by course
 *     description: Returns question sets belonging to a specific course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Question sets retrieved successfully
 *       400:
 *         description: Invalid course ID
 *       404:
 *         description: Course not found
 */
router.get(
    "/courses/:courseId/question-sets",
    validate({
        params: courseIdParamSchema,
    }),
    getQuestionSets
);

/**
 * @swagger
 * /content/question-sets/{setId}/questions:
 *   get:
 *     tags:
 *       - Content
 *     summary: Get questions by question set
 *     description: Returns questions belonging to a specific question set.
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question set ID
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       400:
 *         description: Invalid question set ID
 *       404:
 *         description: Question set not found
 */
router.get(
    "/question-sets/:setId/questions",
    validate({
        params: questionSetIdParamSchema,
    }),
    getQuestions
);

export default router;