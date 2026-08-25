import { Router } from "express";

import {
    getDocumentPresignedUrl,
    updateProfileDocument,
} from "../controllers/profileControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";

import {
    presignDocumentSchema,
    updateProfileDocumentSchema,
} from "../validations/profileValidation";

const router = Router();

router.post(
    "/documents",
    authenticate,
    validate({
        body: presignDocumentSchema,
    }),
    getDocumentPresignedUrl
);

router.patch(
    "/documents",
    authenticate,
    validate({
        body: updateProfileDocumentSchema,
    }),
    updateProfileDocument
);

export default router;