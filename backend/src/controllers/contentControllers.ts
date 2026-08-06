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