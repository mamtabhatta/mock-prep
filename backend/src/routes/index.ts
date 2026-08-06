import { Router } from "express";
import authRoutes from "./authRoutes.js";

const router = Router();

router.use("/auth", authRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

export default router;