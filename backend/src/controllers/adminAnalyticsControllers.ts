import { Request, Response } from "express";

import {
    getQualityAnalyticsService,
    getRetentionAnalyticsService,
    getUsageAnalyticsService,
} from "../services/adminAnalyticsServices";

export const getUsageAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const data = await getUsageAnalyticsService();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Error fetching usage analytics:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch usage analytics",
        });
    }
};

export const getQualityAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const data = await getQualityAnalyticsService();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Error fetching quality analytics:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch quality analytics",
        });
    }
};

export const getRetentionAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const data = await getRetentionAnalyticsService();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Error fetching retention analytics:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch retention analytics",
        });
    }
};