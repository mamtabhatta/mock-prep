import { Router } from "express";
import authRoutes from "./authRoutes";
import contentRoutes from "./contentRoutes";
import userRoutes from "./userRoutes";
import profileRoutes from "./profileRoutes";
import sessionRoutes from "./sessionRoutes";
import universityRoutes from "./universityRoutes";
import courseRoutes from "./courseRoutes";
const router = Router();


router.use("/auth", authRoutes);
router.use("/", contentRoutes);
router.use("/users", userRoutes);
router.use("/profile", profileRoutes);
router.use("/sessions", sessionRoutes);
router.use("/", universityRoutes);
router.use("/", courseRoutes);
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

export default router;