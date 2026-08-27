import { Router } from "express";
import multer from "multer";

import {
    createQuestion,
    getAllQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    bulkImportQuestions,
} from "../controllers/questionControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";

import { questionIdParamSchema } from "../validations/commonValidation";

import {
    createQuestionSchema,
    updateQuestionSchema,
} from "../validations/questionValidation";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

/**
 * @openapi
 * /questions:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Create a question
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
 *         description: Question created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/questions",
    authenticate,
    authorize("super_admin"),
    validate({
        body: createQuestionSchema,
    }),
    createQuestion
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
 * /questions/{questionId}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get a question by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *       400:
 *         description: Invalid question ID
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/questions/:questionId",
    authenticate,
    validate({
        params: questionIdParamSchema,
    }),
    getQuestion
);

/**
 * @openapi
 * /questions/{questionId}:
 *   patch:
 *     tags:
 *       - Questions
 *     summary: Update a question
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
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
 *         description: Question updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.patch(
    "/questions/:questionId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionIdParamSchema,
        body: updateQuestionSchema,
    }),
    updateQuestion
);

/**
 * @openapi
 * /questions/{questionId}:
 *   delete:
 *     tags:
 *       - Questions
 *     summary: Delete a question
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       400:
 *         description: Invalid question ID
 *       401:
 *         description: Unauthorized
 */
router.delete(
    "/questions/:questionId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionIdParamSchema,
    }),
    deleteQuestion
);

/**
 * @openapi
 * /questions/bulk-import:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Bulk import questions from CSV
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Questions imported successfully
 *       400:
 *         description: Invalid file or request
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/questions/bulk-import",
    authenticate,
    authorize("super_admin"),
    upload.single("file"),
    bulkImportQuestions
);

export default router;