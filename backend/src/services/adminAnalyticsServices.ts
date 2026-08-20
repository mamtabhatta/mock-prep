import { sql } from "drizzle-orm";

import { db } from "../db";
import {
    analyticsEvents,
    feedbackReports,
    sessions,
} from "../db/schema";

export const getUsageAnalyticsService = async () => {
    const result = await db
        .select({
            date: sql<string>`DATE(${analyticsEvents.createdAt})`,
            activeUsers: sql<number>`
                COUNT(DISTINCT ${analyticsEvents.userId})
            `,
        })
        .from(analyticsEvents)
        .where(
            sql`${analyticsEvents.userId} IS NOT NULL`
        )
        .groupBy(
            sql`DATE(${analyticsEvents.createdAt})`
        )
        .orderBy(
            sql`DATE(${analyticsEvents.createdAt})`
        );

    return result.map((row) => ({
        date: row.date,
        activeUsers: Number(row.activeUsers ?? 0),
    }));
};

export const getQualityAnalyticsService = async () => {
    const [result] = await db
        .select({
            averageRating: sql<string | null>`
                AVG(
                    (${feedbackReports.scoresJson}->>'overall_score')::numeric
                )
            `,
            totalReports: sql<string | null>`
                COUNT(*)
            `,
        })
        .from(feedbackReports);

    return {
        averageRating: Number(
            result?.averageRating ?? 0
        ),
        totalReports: Number(
            result?.totalReports ?? 0
        ),
    };
};

export const getRetentionAnalyticsService = async () => {
    const queryResult = await db.execute(sql`
        SELECT
            COUNT(DISTINCT CASE
                WHEN first_used_at <= NOW() - INTERVAL '7 days'
                THEN user_id
            END) AS day_7_eligible,

            COUNT(DISTINCT CASE
                WHEN first_used_at <= NOW() - INTERVAL '7 days'
                AND EXISTS (
                    SELECT 1
                    FROM sessions s2
                    WHERE s2.user_id = first_sessions.user_id
                    AND s2.started_at >=
                        first_sessions.first_used_at
                        + INTERVAL '7 days'
                )
                THEN user_id
            END) AS day_7_retained,

            COUNT(DISTINCT CASE
                WHEN first_used_at <= NOW() - INTERVAL '30 days'
                THEN user_id
            END) AS day_30_eligible,

            COUNT(DISTINCT CASE
                WHEN first_used_at <= NOW() - INTERVAL '30 days'
                AND EXISTS (
                    SELECT 1
                    FROM sessions s2
                    WHERE s2.user_id = first_sessions.user_id
                    AND s2.started_at >=
                        first_sessions.first_used_at
                        + INTERVAL '30 days'
                )
                THEN user_id
            END) AS day_30_retained

        FROM (
            SELECT
                user_id,
                MIN(started_at) AS first_used_at
            FROM sessions
            GROUP BY user_id
        ) AS first_sessions
    `);

    const row = queryResult.rows[0] as {
        day_7_eligible: string | number;
        day_7_retained: string | number;
        day_30_eligible: string | number;
        day_30_retained: string | number;
    };

    const day7Eligible = Number(
        row.day_7_eligible ?? 0
    );

    const day7Retained = Number(
        row.day_7_retained ?? 0
    );

    const day30Eligible = Number(
        row.day_30_eligible ?? 0
    );

    const day30Retained = Number(
        row.day_30_retained ?? 0
    );

    return {
        day7Rate:
            day7Eligible > 0
                ? (day7Retained / day7Eligible) * 100
                : 0,

        day30Rate:
            day30Eligible > 0
                ? (day30Retained / day30Eligible) * 100
                : 0,
    };
};