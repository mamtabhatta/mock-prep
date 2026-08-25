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

router.post(
    "/questions",
    authenticate,
    authorize("super_admin"),
    validate({
        body: createQuestionSchema,
    }),
    createQuestion
);

router.get(
    "/questions",
    authenticate,
    getAllQuestions
);

router.get(
    "/questions/:questionId",
    authenticate,
    validate({
        params: questionIdParamSchema,
    }),
    getQuestion
);

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

router.delete(
    "/questions/:questionId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionIdParamSchema,
    }),
    deleteQuestion
);

router.post(
    "/questions/bulk-import",
    authenticate,
    authorize("super_admin"),
    upload.single("file"),
    bulkImportQuestions
);

export default router;