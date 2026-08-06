import { Request, Response, NextFunction } from "express";
import * as contentService from "../services/contentServices";

export const getUniversities = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await contentService.fetchUniversities();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getCoursesByUniversity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { universityId } = req.params;
        const data = await contentService.fetchCoursesByUniversity(universityId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
export const getQuestionSets = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const data = await contentService.getQuestionSetsByCourseId(courseId);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch question sets",
        });
    }
};

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { setId } = req.params;
        const data = await contentService.getQuestionsBySetId(setId);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
        });
    }
};