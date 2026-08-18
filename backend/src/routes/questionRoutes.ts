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
    getQuestion
);

router.patch(
    "/questions/:questionId",
    authenticate,
    authorize("super_admin"),
    updateQuestion
);

router.delete(
    "/questions/:questionId",
    authenticate,
    authorize("super_admin"),
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