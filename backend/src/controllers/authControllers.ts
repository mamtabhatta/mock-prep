import { Request, Response, NextFunction } from "express";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "../validations/authValidation";
import * as authService from "../services/authServices";
import * as googleAuthService from "../services/googleAuthServices";

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

export const googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const url = googleAuthService.getGoogleAuthUrl();

        return res.redirect(url);
    } catch (error) {
        next(error);
    }
};

export const googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const code = req.query.code as string;

        if (!code) {
            throw new Error("Google authorization code is missing");
        }

        const result =
            await googleAuthService.handleGoogleCallback(code);

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        const params = new URLSearchParams({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: JSON.stringify(result.user),
        });

        return res.redirect(
            `${frontendUrl}/auth/google/callback?${params.toString()}`
        );
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
            data: {
                resetUrl: result.resetUrl,
            },
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
        const token =
            (req.query.token as string) ||
            req.body.token;

        const data = verifyEmailSchema.parse({
            token,
        });

        const result =
            await authService.verifyEmail(data.token);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};