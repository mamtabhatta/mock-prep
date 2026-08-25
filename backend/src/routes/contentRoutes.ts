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

router.get(
    "/universities",
    getUniversities
);

router.get(
    "/universities/:universityId/courses",
    validate({
        params: universityIdParamSchema,
    }),
    getCoursesByUniversity
);

router.get(
    "/courses/:courseId/question-sets",
    validate({
        params: courseIdParamSchema,
    }),
    getQuestionSets
);

router.get(
    "/question-sets/:setId/questions",
    validate({
        params: questionSetIdParamSchema,
    }),
    getQuestions
);

export default router;