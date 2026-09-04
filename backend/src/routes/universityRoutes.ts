import { Router } from "express";

import {
    createUniversity,
    getUniversity,
    updateUniversity,
    deactivateUniversity,
    deleteUniversity,
    getUniversities,
} from "../controllers/universityControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";

import {
    universityIdParamSchema,
} from "../validations/commonValidation";

const router = Router();

/**
 * @openapi
 * /universities:
 *   post:
 *     tags:
 *       - Universities
 *     summary: Create a university
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
 *         description: University created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/universities",
    authenticate,
    authorize("super_admin"),
    createUniversity
);

/**
 * @openapi
 * /universities:
 *   get:
 *     tags:
 *       - Universities
 *     summary: Get all universities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Universities retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/universities",
    authenticate,
    getUniversities
);

/**
 * @openapi
 * /universities/{universityId}:
 *   get:
 *     tags:
 *       - Universities
 *     summary: Get a university
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University retrieved successfully
 *       400:
 *         description: Invalid university ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: University not found
 */
router.get(
    "/universities/:universityId",
    authenticate,
    validate({
        params: universityIdParamSchema,
    }),
    getUniversity
);

/**
 * @openapi
 * /universities/{universityId}:
 *   patch:
 *     tags:
 *       - Universities
 *     summary: Update a university
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: universityId
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
 *         description: University updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: University not found
 */
router.patch(
    "/universities/:universityId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: universityIdParamSchema,
    }),
    updateUniversity
);

/**
 * @openapi
 * /universities/{universityId}/deactivate:
 *   patch:
 *     tags:
 *       - Universities
 *     summary: Deactivate a university
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University deactivated successfully
 *       400:
 *         description: Invalid university ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: University not found
 */
router.patch(
    "/universities/:universityId/deactivate",
    authenticate,
    authorize("super_admin"),
    validate({
        params: universityIdParamSchema,
    }),
    deactivateUniversity
);

/**
 * @openapi
 * /universities/{universityId}:
 *   delete:
 *     tags:
 *       - Universities
 *     summary: Delete a university
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University deleted successfully
 *       400:
 *         description: Invalid university ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: University not found
 */
router.delete(
    "/universities/:universityId",
    authenticate,
    authorize("super_admin"),
    validate({
        params: universityIdParamSchema,
    }),
    deleteUniversity
);

export default router;