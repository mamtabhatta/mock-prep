import { Router } from "express";
import { register, login } from "../controllers/authControllers";
import { refresh } from "../controllers/authControllers";
const router = Router();

router.post("/refresh", refresh);

router.post("/register", register);

router.post("/login", login);

export default router;