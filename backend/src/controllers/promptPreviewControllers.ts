import { Request, Response, NextFunction } from "express";
import * as promptPreviewServices from "../services/promptPreviewServices";

export const previewPrompt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { module, transcript } = req.body;

        const result =
            await promptPreviewServices.previewPrompt({
                module,
                transcript,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};