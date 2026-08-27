import { Router } from "express";

import {
    createUniversity,
    getUniversity,
    updateUniversity,
    deactivateUniversity,
    deleteUniversity,
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
 *     responses:
 *       201:
 *         description: University created successfully
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
 *     responses:
 *       200:
 *         description: University updated successfully
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