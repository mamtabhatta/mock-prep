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

router.post(
    "/question-sets",
    authenticate,
    authorize("super_admin"),
    validate({
        body: createQuestionSetSchema,
    }),
    createQuestionSet
);

router.get(
    "/question-sets/:setId",
    authenticate,
    validate({
        params: questionSetIdParamSchema,
    }),
    getQuestionSet
);

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

router.patch(
    "/question-sets/:setId/deactivate",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionSetIdParamSchema,
    }),
    deactivateQuestionSet
);

router.delete(
    "/question-sets/:setId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: questionSetIdParamSchema,
    }),
    deleteQuestionSet
);

router.get(
    "/question-sets/:setId/questions",
    authenticate,
    validate({
        params: questionSetIdParamSchema,
    }),
    getQuestionsForSet
);

router.get(
    "/questions",
    authenticate,
    getAllQuestions
);

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