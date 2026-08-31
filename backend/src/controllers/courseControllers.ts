import { Request, Response, NextFunction } from "express";
import * as courseService from "../services/courseServices";

export const createCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await courseService.createCourse(req.body);

        return res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;
        const data = await courseService.getCourse(courseId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;

        const data = await courseService.updateCourse(
            courseId,
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

export const deactivateCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;

        const data =
            await courseService.deactivateCourse(courseId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;

        const data =
            await courseService.deleteCourse(courseId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};
export const getAllCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const universityId =
            req.query.universityId as string | undefined;

        const data =
            await courseService.getAllCourses(
                universityId
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};