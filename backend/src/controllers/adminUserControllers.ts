import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getAdminUsersService, getAdminUserDetailService, } from "../services/adminUserServices";

export const getAdminUsers = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : undefined;

        const role =
            typeof req.query.role === "string"
                ? req.query.role
                : undefined;

        const isSuspended =
            typeof req.query.is_suspended === "string"
                ? req.query.is_suspended === "true"
                : undefined;

        const page =
            typeof req.query.page === "string"
                ? Number(req.query.page)
                : 1;

        const limit =
            typeof req.query.limit === "string"
                ? Number(req.query.limit)
                : 10;

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer",
            });
        }

        if (!Number.isInteger(limit) || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Limit must be a positive integer",
            });
        }

        if (
            role &&
            !["student", "counselor", "super_admin"].includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        if (
            req.query.is_suspended !== undefined &&
            req.query.is_suspended !== "true" &&
            req.query.is_suspended !== "false"
        ) {
            return res.status(400).json({
                success: false,
                message: "is_suspended must be true or false",
            });
        }

        const result = await getAdminUsersService({
            currentUserId: userId,
            search,
            role: role as
                | "student"
                | "counselor"
                | "super_admin"
                | undefined,
            isSuspended,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getAdminUserDetail = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const adminId = req.user?.userId;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const result = await getAdminUserDetailService(userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};