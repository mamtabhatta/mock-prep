import { Router } from "express";
import { getDocumentPresignedUrl, updateProfileDocument} from "../controllers/profileControllers";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/documents", authenticate, getDocumentPresignedUrl);

router.patch("/documents", authenticate, updateProfileDocument);
export default router;