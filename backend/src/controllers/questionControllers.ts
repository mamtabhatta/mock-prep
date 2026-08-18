import { Request, Response, NextFunction } from "express";
import * as questionService from "../services/questionServices";

export const createQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            questionSetId,
            text,
            typeTag,
            difficulty,
            frequency,
            orderIndex,
        } = req.body;

        if (!questionSetId || !text) {
            return res.status(400).json({
                success: false,
                message: "questionSetId and text are required",
            });
        }

        const data = await questionService.createQuestion({
            questionSetId,
            text,
            typeTag,
            difficulty,
            frequency,
            orderIndex,
        });

        return res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await questionService.getAllQuestions();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { questionId } = req.params;

        const data =
            await questionService.getQuestion(questionId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const updateQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { questionId } = req.params;

        const data =
            await questionService.updateQuestion(
                questionId,
                req.body
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { questionId } = req.params;

        await questionService.deleteQuestion(questionId);

        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const bulkImportQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "CSV file is required",
            });
        }

        const data =
            await questionService.bulkImportQuestions(
                req.file.buffer
            );

        return res.status(201).json({
            success: true,
            message: "Questions imported successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};