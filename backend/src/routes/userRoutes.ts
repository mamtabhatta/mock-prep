import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getProfile, updateProfile } from "../controllers/userControllers";

const router = Router();

router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);

export default router;