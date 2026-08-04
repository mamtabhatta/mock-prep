import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validations/authValidation";
import * as authService from "../services/authServices";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = registerSchema.parse(req.body);

        const user = await authService.register(data);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
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