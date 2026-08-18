import {
    and,
    eq,
    isNotNull,
    lt,
} from "drizzle-orm";

import { db } from "../db";
import { sessionAnswers } from "../db/schema";
import { deleteObject } from "./storageServices";

const getRetentionDays = (): number => {
    const value = Number(
        process.env.RECORDING_RETENTION_DAYS ||
            "30"
    );

    if (!Number.isFinite(value) || value < 0) {
        return 30;
    }

    return value;
};

export const cleanupOldRecordings = async () => {
    const retentionDays =
        getRetentionDays();

    const cutoffDate = new Date();

    cutoffDate.setDate(
        cutoffDate.getDate() -
            retentionDays
    );

    console.log(
        "================================="
    );

    console.log(
        "RECORDING CLEANUP STARTED"
    );

    console.log(
        "Retention days:",
        retentionDays
    );

    console.log(
        "Cutoff date:",
        cutoffDate.toISOString()
    );

    console.log(
        "================================="
    );

    const oldRecordings =
        await db
            .select({
                id: sessionAnswers.id,

                recordingUrl:
                    sessionAnswers.recordingUrl,

                createdAt:
                    sessionAnswers.createdAt,
            })
            .from(sessionAnswers)
            .where(
                and(
                    isNotNull(
                        sessionAnswers.recordingUrl
                    ),

                    lt(
                        sessionAnswers.createdAt,
                        cutoffDate
                    )
                )
            );

    console.log(
        `Found ${oldRecordings.length} old recordings.`
    );

    let deleted = 0;

    let failed = 0;

    for (const recording of oldRecordings) {
        if (!recording.recordingUrl) {
            continue;
        }

        try {
            console.log(
                `Deleting recording: ${recording.recordingUrl}`
            );

            await deleteObject(
                recording.recordingUrl
            );

            await db
                .update(sessionAnswers)
                .set({
                    recordingUrl: null,
                })
                .where(
                    eq(
                        sessionAnswers.id,
                        recording.id
                    )
                );

            deleted++;

            console.log(
                `Successfully deleted recording for answer ${recording.id}`
            );
        } catch (error) {
            failed++;

            console.error(
                `Failed to delete recording for answer ${recording.id}:`,
                error
            );
        }
    }

    console.log(
        "================================="
    );

    console.log(
        "RECORDING CLEANUP FINISHED"
    );

    console.log(
        "Found:",
        oldRecordings.length
    );

    console.log(
        "Deleted:",
        deleted
    );

    console.log(
        "Failed:",
        failed
    );

    console.log(
        "================================="
    );

    return {
        success: true,

        found: oldRecordings.length,

        deleted,

        failed,
    };
};