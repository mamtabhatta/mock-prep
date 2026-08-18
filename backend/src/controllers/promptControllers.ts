import { Request, Response, NextFunction } from "express";
import * as promptServices from "../services/promptServices";

export const createPrompt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const prompt = await promptServices.createPrompt({
            module: req.body.module,
            contentText: req.body.contentText,
           createdBy: undefined,
        });

        return res.status(201).json({
            success: true,
            data: prompt,
        });
    } catch (error) {
        next(error);
    }
};

export const getPromptHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const prompts = await promptServices.getPromptHistory(
            req.params.module as promptServices.PromptModule
        );

        return res.status(200).json({
            success: true,
            data: prompts,
        });
    } catch (error) {
        next(error);
    }
};

export const getActivePrompt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const prompt = await promptServices.getActivePrompt(
            req.params.module as promptServices.PromptModule
        );

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: "Active prompt not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: prompt,
        });
    } catch (error) {
        next(error);
    }
};

export const activatePrompt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await promptServices.activatePrompt(
            req.params.promptId
        );

        return res.status(200).json({
            success: true,
            message: "Prompt activated successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const rollbackPrompt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await promptServices.rollbackPrompt(
            req.params.promptId
        );

        return res.status(200).json({
            success: true,
            message: "Prompt rolled back successfully",
        });
    } catch (error) {
        next(error);
    }
};