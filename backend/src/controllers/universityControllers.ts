import { Request, Response, NextFunction } from "express";
import * as universityServices from "../services/universityServices";

export const createUniversity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const university =
            await universityServices.createUniversity(req.body);

        return res.status(201).json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};

export const getUniversity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const university =
            await universityServices.getUniversityById(
                req.params.universityId
            );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUniversity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const university =
            await universityServices.updateUniversity(
                req.params.universityId,
                req.body
            );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateUniversity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const university =
            await universityServices.deactivateUniversity(
                req.params.universityId
            );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUniversity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const university =
            await universityServices.deleteUniversity(
                req.params.universityId
            );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};
export const getUniversities = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const universities =
            await universityServices.getAllUniversities();

        return res.status(200).json({
            success: true,
            data: universities,
        });
    } catch (error) {
        next(error);
    }
};