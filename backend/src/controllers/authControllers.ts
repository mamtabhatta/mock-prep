import { Request, Response, NextFunction } from "express";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "../validations/authValidation";
import * as authService from "../services/authServices";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = registerSchema.parse(req.body);

        const result = await authService.register(data);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = loginSchema.parse(req.body);

        const result = await authService.login(data);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.refresh(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = forgotPasswordSchema.parse(req.body);

        const result = await authService.forgotPassword(data);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = resetPasswordSchema.parse(req.body);

        const result = await authService.resetPassword(data);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = (req.query.token as string) || req.body.token;

        const data = verifyEmailSchema.parse({ token });

        const result = await authService.verifyEmail(data.token);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};