import { eq, and } from "drizzle-orm";

import { db } from "../db";
import {
    sessions,
    sessionAnswers,
    feedbackReports,
} from "../db/schema";

import { CreateSessionInput } from "../validations/sessionValidation";

export const createSession = async (
    userId: string,
    data: CreateSessionInput
) => {
    const [session] = await db
        .insert(sessions)
        .values({
            userId,
            module: data.module,
            universityId: data.universityId ?? null,
            courseId: data.courseId ?? null,
            questionSetId: data.questionSetId ?? null,
        })
        .returning();

    return session;
};

export const getUserSessions = async (userId: string) => {
    const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId));

    return userSessions;
};


/* Get complete session details */
export const getSessionById = async (
    userId: string,
    sessionId: string
) => {
    // Get the session and make sure it belongs to the logged-in user
    const [session] = await db
        .select()
        .from(sessions)
        .where(
            and(
                eq(sessions.id, sessionId),
                eq(sessions.userId, userId)
            )
        );

    if (!session) {
        throw new Error("Session not found");
    }

    // Get all answers belonging to this session
    const answers = await db
        .select()
        .from(sessionAnswers)
        .where(eq(sessionAnswers.sessionId, sessionId));

    // Get feedback report for this session
    const [feedbackReport] = await db
        .select()
        .from(feedbackReports)
        .where(eq(feedbackReports.sessionId, sessionId));

    return {
        ...session,
        answers,
        feedbackReport: feedbackReport ?? null,
    };
};