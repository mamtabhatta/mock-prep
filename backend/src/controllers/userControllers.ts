import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware"; 
import { updateProfileSchema } from "../validations/authValidation";
import {
    getUserProfileService,
    updateUserProfileService,
} from "../services/userServices";

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const userProfile = await getUserProfileService(userId);
        if (!userProfile) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ success: true, data: userProfile });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const validatedData = updateProfileSchema.parse(req.body);
        const updated = await updateUserProfileService(userId, validatedData);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updated,
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        return res.status(500).json({ message: error.message });
    }
};