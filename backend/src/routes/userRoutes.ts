import { Router } from "express";

import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import { updateProfile } from "../controllers/userControllers";
import { updateProfileSchema } from "../validations/authValidation";
import { getProfile } from "../controllers/userControllers";

const router = Router();

router.get(
    "/me",
    authenticate,
    getProfile
);

router.put(
    "/me",
    authenticate,
    validate({
        body: updateProfileSchema,
    }),
    updateProfile
);

export default router;