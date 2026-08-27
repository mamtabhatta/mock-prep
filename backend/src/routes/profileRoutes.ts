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

/**
 * @openapi
 * /documents:
 *   post:
 *     tags:
 *       - Profile Documents
 *     summary: Generate a presigned URL for a profile document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 */
router.post(
    "/documents",
    authenticate,
    validate({
        body: presignDocumentSchema,
    }),
    getDocumentPresignedUrl
);

/**
 * @openapi
 * /documents:
 *   patch:
 *     tags:
 *       - Profile Documents
 *     summary: Update a profile document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile document updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 */
router.patch(
    "/documents",
    authenticate,
    validate({
        body: updateProfileDocumentSchema,
    }),
    updateProfileDocument
);

export default router;