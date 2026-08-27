import { Router } from "express";

import {
    createQuestionSet,
    getQuestionSet,
    updateQuestionSet,
    deactivateQuestionSet,
    deleteQuestionSet,
    getQuestionsForSet,
    reorderQuestions,
    getAllQuestions,
} from "../controllers/questionSetControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";

import { questionSetIdParamSchema } from "../validations/commonValidation";

import {
    createQuestionSetSchema,
    updateQuestionSetSchema,
    reorderQuestionsSchema,
} from "../validations/questionSetValidation";

const router = Router();

/**
 * @openapi
 * /question-sets:
 *   post:
 *     tags:
 *       - Question Sets
 *     summary: Create a question set
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Question set created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/question-sets",
    authenticate,
    authorize("super_admin"),
    validate({
        body: createQuestionSetSchema,
    }),
    createQuestionSet
);

/**
 * @openapi
 * /question-sets/{setId}:
 *   get:
 *     tags:
 *       - Question Sets
 *     summary: Get a question set
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question set retrieved successfully
 *       400:
 *         description: Invalid question set ID
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/question-sets/:setId",
    authenticate,
    validate({
        params: questionSetIdParamSchema,
    }),
    getQuestionSet
);

/**
 * @openapi
 * /question-sets/{setId}:
 *   patch:
 *     tags:
 *       - Question Sets
 *     summary: Update a question set
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Question set updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.patch(
    "/question-sets/:setId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionSetIdParamSchema,
        body: updateQuestionSetSchema,
    }),
    updateQuestionSet
);

/**
 * @openapi
 * /question-sets/{setId}/deactivate:
 *   patch:
 *     tags:
 *       - Question Sets
 *     summary: Deactivate a question set
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question set deactivated successfully
 *       400:
 *         description: Invalid question set ID
 *       401:
 *         description: Unauthorized
 */
router.patch(
    "/question-sets/:setId/deactivate",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionSetIdParamSchema,
    }),
    deactivateQuestionSet
);

/**
 * @openapi
 * /question-sets/{setId}:
 *   delete:
 *     tags:
 *       - Question Sets
 *     summary: Delete a question set
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question set deleted successfully
 *       400:
 *         description: Invalid question set ID
 *       401:
 *         description: Unauthorized
 */
router.delete(
    "/question-sets/:setId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionSetIdParamSchema,
    }),
    deleteQuestionSet
);

/**
 * @openapi
 * /question-sets/{setId}/questions:
 *   get:
 *     tags:
 *       - Question Sets
 *     summary: Get questions for a question set
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       400:
 *         description: Invalid question set ID
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/question-sets/:setId/questions",
    authenticate,
    validate({
        params: questionSetIdParamSchema,
    }),
    getQuestionsForSet
);

/**
 * @openapi
 * /questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get all questions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/questions",
    authenticate,
    getAllQuestions
);

/**
 * @openapi
 * /question-sets/{setId}/questions/reorder:
 *   patch:
 *     tags:
 *       - Question Sets
 *     summary: Reorder questions in a question set
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Questions reordered successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.patch(
    "/question-sets/:setId/questions/reorder",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionSetIdParamSchema,
        body: reorderQuestionsSchema,
    }),
    reorderQuestions
);

export default router;