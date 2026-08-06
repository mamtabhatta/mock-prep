import { Router } from "express";
import {
    getUniversities,
    getCoursesByUniversity,
} from "../controllers/contentControllers";

const router = Router();


router.get("/universities", getUniversities);

router.get("/universities/:universityId/courses", getCoursesByUniversity);

export default router;