import { Request, Response, NextFunction } from "express";
import * as questionSetService from "../services/questionSetServices";

export const createQuestionSet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId, name, description } = req.body;

        if (!courseId || !name) {
            return res.status(400).json({
                success: false,
                message: "courseId and name are required",
            });
        }

        const data = await questionSetService.createQuestionSet(
            courseId,
            name,
            description
        );

        return res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getQuestionSet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { setId } = req.params;

        const data = await questionSetService.getQuestionSet(setId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const updateQuestionSet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { setId } = req.params;
        const { name, description, isActive } = req.body;

        const data = await questionSetService.updateQuestionSet(
            setId,
            {
                name,
                description,
                isActive,
            }
        );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateQuestionSet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { setId } = req.params;

        await questionSetService.deactivateQuestionSet(setId);

        return res.status(200).json({
            success: true,
            message: "Question set deactivated successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const deleteQuestionSet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { setId } = req.params;

        await questionSetService.deleteQuestionSet(setId);

        return res.status(200).json({
            success: true,
            message: "Question set deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};



export const getQuestionsForSet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { setId } = req.params;

        const data =
            await questionSetService.getQuestionsForSet(setId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const reorderQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { setId } = req.params;
        const { questionIds } = req.body;

        if (
            !Array.isArray(questionIds) ||
            questionIds.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "questionIds must be a non-empty array",
            });
        }

        const data =
            await questionSetService.reorderQuestions(
                setId,
                questionIds
            );

        return res.status(200).json({
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
        const data =
            await questionSetService.getAllQuestions();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};