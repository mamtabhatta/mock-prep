import { Router } from "express";
import {
    getUniversities,
    getCoursesByUniversity,
    getQuestionSets,
    getQuestions
} from "../controllers/contentControllers";

const router = Router();


router.get("/universities", getUniversities);

router.get("/universities/:universityId/courses", getCoursesByUniversity);

router.get("/courses/:courseId/question-sets", getQuestionSets);

router.get("/question-sets/:setId/questions", getQuestions);
export default router;