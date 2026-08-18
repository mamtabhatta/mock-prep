import { Router } from "express";
import {
    createQuestionSet,
    getQuestionSet,
    updateQuestionSet,
    deactivateQuestionSet,
    deleteQuestionSet,
    getQuestionsForSet,
    reorderQuestions,
    getAllQuestions
} from "../controllers/questionSetControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.post(
    "/question-sets",
    authenticate,
    authorize("super_admin"),
    createQuestionSet
);

router.get(
    "/question-sets/:setId",
    authenticate,
    getQuestionSet
);

router.patch(
    "/question-sets/:setId",
    authenticate,
    authorize("super_admin"),
    updateQuestionSet
);

router.patch(
    "/question-sets/:setId/deactivate",
    authenticate,
    authorize("super_admin"),
    deactivateQuestionSet
);

router.delete(
    "/question-sets/:setId",
    authenticate,
    authorize("super_admin"),
    deleteQuestionSet
);

router.get(
    "/question-sets/:setId/questions",
    authenticate,
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
    reorderQuestions
);

export default router;