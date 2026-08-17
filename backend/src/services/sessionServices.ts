import crypto from "crypto";

import {
    eq,
    and,
} from "drizzle-orm";

import { db } from "../db";

import {
    sessions,
    sessionAnswers,
    feedbackReports,
    questions,
} from "../db/schema";

import {
    CreateSessionInput,
} from "../validations/sessionValidation";

import {
    uploadAudio,
    deleteObject,
} from "./storageServices";

import {
    enqueueJob,
} from "./jobServices";
// ============================================
// CREATE SESSION
// ============================================

export const createSession = async (
    userId: string,
    data: CreateSessionInput
) => {
    const [session] =
        await db
            .insert(sessions)
            .values({
                userId,
                module: data.module,
                universityId:
                    data.universityId ?? null,
                courseId:
                    data.courseId ?? null,
                questionSetId:
                    data.questionSetId ?? null,
            })
            .returning();

    return session;
};


// ============================================
// GET USER SESSIONS
// ============================================

export const getUserSessions = async (
    userId: string
) => {
    const userSessions =
        await db
            .select()
            .from(sessions)
            .where(
                eq(
                    sessions.userId,
                    userId
                )
            );

    return userSessions;
};


// ============================================
// GET SESSION DETAIL
// ============================================

export const getSessionById = async (
    userId: string,
    sessionId: string
) => {
    const [session] =
        await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(
                        sessions.id,
                        sessionId
                    ),
                    eq(
                        sessions.userId,
                        userId
                    )
                )
            );

    if (!session) {
        throw new Error(
            "Session not found"
        );
    }

    const answers =
        await db
            .select()
            .from(sessionAnswers)
            .where(
                eq(
                    sessionAnswers.sessionId,
                    sessionId
                )
            );

    const [feedbackReport] =
        await db
            .select()
            .from(feedbackReports)
            .where(
                eq(
                    feedbackReports.sessionId,
                    sessionId
                )
            );

    return {
        ...session,
        answers,
        feedbackReport:
            feedbackReport ?? null,
    };
};


// ============================================
// CREATE SESSION ANSWER
// ============================================

export const createSessionAnswer = async (
    userId: string,
    sessionId: string,
    questionId: string,
    audioBuffer: Buffer,
    contentType: string,
    durationSeconds?: number
) => {

    // Check session ownership
    const [session] =
        await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(
                        sessions.id,
                        sessionId
                    ),
                    eq(
                        sessions.userId,
                        userId
                    )
                )
            );


    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    // Check question
    const [question] =
        await db
            .select()
            .from(questions)
            .where(
                eq(
                    questions.id,
                    questionId
                )
            );


    if (!question) {
        throw new Error(
            "Question not found"
        );
    }


    // Generate storage key
    const extension =
        contentType.split("/")[1] ||
        "webm";


    const key =
        `sessions/${sessionId}/answers/${crypto.randomUUID()}.${extension}`;


    // Upload audio
    await uploadAudio(
        key,
        audioBuffer,
        contentType
    );


    // Create answer
    const [answer] =
        await db
            .insert(sessionAnswers)
            .values({
                sessionId,

                questionId,

                recordingUrl:
                    key,

                durationSeconds:
                    durationSeconds ??
                    null,

                transcriptionStatus:
                    "pending",
            })
            .returning();


    // Add transcription job
    await enqueueJob(
        "transcribe-answer",
        {
            answerId:
                answer.id,

            sessionId,

            recordingUrl:
                key,

            contentType,
        }
    );


    return answer;
};


// ============================================
// SUBMIT SESSION
// ============================================

export const submitSession = async (
    userId: string,
    sessionId: string
) => {

    // Check ownership
    const [session] =
        await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(
                        sessions.id,
                        sessionId
                    ),
                    eq(
                        sessions.userId,
                        userId
                    )
                )
            );

    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    // Only an in-progress session
    // can be submitted.
    if (
        session.status !==
        "in_progress"
    ) {
        throw new Error(
            "Session cannot be submitted"
        );
    }


    // Update status
    const [updatedSession] =
        await db
            .update(sessions)
            .set({
                status: "submitted",
                submittedAt:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        sessions.id,
                        sessionId
                    ),
                    eq(
                        sessions.userId,
                        userId
                    )
                )
            )
            .returning();

    return updatedSession;
};


// ============================================
// DELETE SESSION
// ============================================

export const deleteSession = async (
    userId: string,
    sessionId: string
) => {

    // Check ownership
    const [session] =
        await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(
                        sessions.id,
                        sessionId
                    ),
                    eq(
                        sessions.userId,
                        userId
                    )
                )
            );

    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    // Get answers before cascade deletion
    const answers =
        await db
            .select()
            .from(sessionAnswers)
            .where(
                eq(
                    sessionAnswers.sessionId,
                    sessionId
                )
            );


    // Delete recordings from storage
    for (
        const answer of answers
    ) {
        if (
            answer.recordingUrl
        ) {
            await deleteObject(
                answer.recordingUrl
            );
        }
    }


    // Delete session.
    // DB cascade deletes:
    // - session_answers
    // - feedback_reports
    await db
        .delete(sessions)
        .where(
            eq(
                sessions.id,
                sessionId
            )
        );


    return {
        id: sessionId,
        deleted: true,
    };
};