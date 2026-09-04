import crypto from "crypto";

import {
    eq,
    and,
    asc,
} from "drizzle-orm";

import { db } from "../db";

import {
    sessions,
    sessionAnswers,
    feedbackReports,
    sessionQuestions,
} from "../db/schema";

import {
    uploadAudio,
    deleteObject,
    generatePresignedGetUrl,
} from "./storageServices";

import { enqueueJob } from "./jobServices";

import type {
    CreateSessionInput,
} from "../validations/sessionValidation";


// ============================================
// CREATE SESSION
// ============================================

export const createSession = async (
    userId: string,
    data: CreateSessionInput
) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE INTERVIEW FORMAT
    |--------------------------------------------------------------------------
    */

    if (
        data.module === "interview" &&
        !data.interviewFormat
    ) {
        throw new Error(
            "Interview format is required for interview sessions"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REMOVE FORMAT FROM NON-INTERVIEW MODULES
    |--------------------------------------------------------------------------
    */

    const interviewFormat =
        data.module === "interview"
            ? data.interviewFormat
            : null;


    const [session] = await db
        .insert(sessions)
        .values({
            ...data,

            interviewFormat,

            userId,

            status: "in_progress",

            startedAt: new Date(),
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

    const userSessions = await db
        .select()
        .from(sessions)
        .where(
            eq(
                sessions.userId,
                userId
            )
        )
        .orderBy(
            asc(
                sessions.createdAt
            )
        );


    const result = await Promise.all(

        userSessions.map(
            async (session) => {

                const [feedbackReport] =
                    await db
                        .select()
                        .from(feedbackReports)
                        .where(
                            eq(
                                feedbackReports.sessionId,
                                session.id
                            )
                        )
                        .limit(1);


                return {
                    ...session,

                    feedbackReport:
                        feedbackReport ??
                        null,
                };
            }
        )
    );


    return result;
};


// ============================================
// GET SESSION BY ID
// ============================================

export const getSessionById = async (
    userId: string,
    sessionId: string
) => {

    const [session] = await db
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
        )
        .limit(1);


    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    const answers = await db
        .select()
        .from(sessionAnswers)
        .where(
            eq(
                sessionAnswers.sessionId,
                sessionId
            )
        )
        .orderBy(
            asc(
                sessionAnswers.createdAt
            )
        );


    const questions = await db
        .select()
        .from(sessionQuestions)
        .where(
            eq(
                sessionQuestions.sessionId,
                sessionId
            )
        )
        .orderBy(
            asc(
                sessionQuestions.orderIndex
            )
        );


    const [feedbackReport] = await db
        .select()
        .from(feedbackReports)
        .where(
            eq(
                feedbackReports.sessionId,
                sessionId
            )
        )
        .limit(1);


    return {
        ...session,

        questions,

        answers,

        feedbackReport:
            feedbackReport ??
            null,
    };
};


// ============================================
// CREATE SESSION ANSWER
// ============================================

export const createSessionAnswer = async (
    userId: string,
    sessionId: string,
    questionId: string,
    buffer: Buffer,
    mimetype: string,
    durationSeconds?: number
) => {
    const [session] = await db
        .select()
        .from(sessions)
        .where(
            and(
                eq(sessions.id, sessionId),
                eq(sessions.userId, userId)
            )
        )
        .limit(1);

    if (!session) {
        throw new Error("Session not found");
    }

    console.log(
        "ANSWER UPLOAD SESSION STATUS:",
        session.status,
        "MODULE:",
        session.module,
        "QUESTION:",
        questionId
    );

    if (session.status !== "in_progress") {
        throw new Error("Session is no longer in progress");
    }

    const [sessionQuestion] = await db
        .select()
        .from(sessionQuestions)
        .where(
            and(
                eq(sessionQuestions.sessionId, sessionId),
                eq(sessionQuestions.id, questionId)
            )
        )
        .limit(1);

    if (!sessionQuestion) {
        throw new Error(
            "Question does not belong to this session"
        );
    }

    let extension = "webm";

    if (
        mimetype === "audio/mp4" ||
        mimetype === "audio/m4a"
    ) {
        extension = "m4a";
    } else if (mimetype === "audio/mpeg") {
        extension = "mp3";
    } else if (mimetype === "audio/wav") {
        extension = "wav";
    } else if (mimetype === "audio/ogg") {
        extension = "ogg";
    }

    const storageKey =
        `sessions/${sessionId}/answers/${crypto.randomUUID()}.${extension}`;

    await uploadAudio(
        storageKey,
        buffer,
        mimetype
    );

    try {
        const [answer] = await db
            .insert(sessionAnswers)
            .values({
                sessionId,
                questionId,
                recordingUrl: storageKey,
                durationSeconds,
                transcriptionStatus: "pending",
            })
            .returning();

        await enqueueJob(
            "transcribe-answer",
            {
                answerId: answer.id,
                sessionId,
                recordingUrl: storageKey,
                contentType: mimetype,
            }
        );

        return answer;
    } catch (error) {
        try {
            await deleteObject(storageKey);
        } catch (cleanupError) {
            console.error(
                "Failed to cleanup uploaded audio:",
                cleanupError
            );
        }

        throw error;
    }
};


// ============================================
// SUBMIT SESSION
// ============================================

export const submitSession = async (
    userId: string,
    sessionId: string
) => {
    const [session] = await db
        .select()
        .from(sessions)
        .where(
            and(
                eq(sessions.id, sessionId),
                eq(sessions.userId, userId)
            )
        )
        .limit(1);

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.status !== "in_progress") {
        throw new Error("Session is no longer in progress");
    }

    if (session.module === "speaking") {
        const questions = await db
            .select()
            .from(sessionQuestions)
            .where(
                eq(sessionQuestions.sessionId, sessionId)
            );

        const speakingAnswers = await db
            .select()
            .from(sessionAnswers)
            .where(
                eq(sessionAnswers.sessionId, sessionId)
            );
console.log("SPEAKING QUESTIONS:", questions);
console.log("SPEAKING QUESTION COUNT:", questions.length);
        if (questions.length !== 3) {
            throw new Error(
                "Speaking session does not contain exactly 3 questions"
            );
        }

        if (speakingAnswers.length !== 3) {
            throw new Error(
                `Please complete all 3 speaking questions before submitting. ${speakingAnswers.length}/3 completed.`
            );
        }

        const questionIds = new Set(
            questions.map((question) => question.id)
        );

        const answeredQuestionIds = new Set(
            speakingAnswers
                .filter((answer) => answer.questionId)
                .map((answer) => answer.questionId!)
        );

        for (const questionId of questionIds) {
            if (!answeredQuestionIds.has(questionId)) {
                throw new Error(
                    "Please complete all 3 speaking questions before submitting"
                );
            }
        }
    }

    const [updatedSession] = await db
        .update(sessions)
        .set({
            status: "submitted",
            submittedAt: new Date(),
        })
        .where(
            and(
                eq(sessions.id, sessionId),
                eq(sessions.userId, userId),
                eq(sessions.status, "in_progress")
            )
        )
        .returning();

    if (!updatedSession) {
        throw new Error("Session could not be submitted");
    }

    const answers = await db
        .select()
        .from(sessionAnswers)
        .where(
            eq(sessionAnswers.sessionId, sessionId)
        );

    const allTranscriptionsCompleted =
        answers.length > 0 &&
        answers.every(
            (answer) =>
                answer.transcriptionStatus === "completed" &&
                Boolean(answer.transcript?.trim())
        );

    if (allTranscriptionsCompleted) {
        await enqueueJob("generate-feedback", {
            sessionId,
        });
    }

    return updatedSession;
};


// ============================================
// DELETE SESSION
// ============================================

export const deleteSession = async (
    userId: string,
    sessionId: string
) => {

    const [session] = await db
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
        )
        .limit(1);


    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    const answers = await db
        .select()
        .from(sessionAnswers)
        .where(
            eq(
                sessionAnswers.sessionId,
                sessionId
            )
        );


    for (
        const answer of answers
    ) {

        if (
            answer.recordingUrl
        ) {

            try {

                await deleteObject(
                    answer.recordingUrl
                );

            } catch (error) {

                console.error(
                    `Failed to delete recording ${answer.recordingUrl}:`,
                    error
                );

            }
        }
    }


    await db
        .delete(sessions)
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


    return {
        success: true,
    };
};


// ============================================
// GET ANSWER PLAYBACK URL
// ============================================

export const getAnswerPlaybackUrl = async (
    userId: string,
    sessionId: string,
    answerId: string
) => {

    const [session] = await db
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
        )
        .limit(1);


    if (!session) {
        throw new Error(
            "Session not found"
        );
    }


    const [answer] = await db
        .select()
        .from(sessionAnswers)
        .where(
            and(
                eq(
                    sessionAnswers.id,
                    answerId
                ),

                eq(
                    sessionAnswers.sessionId,
                    sessionId
                )
            )
        )
        .limit(1);


    if (!answer) {
        throw new Error(
            "Answer not found"
        );
    }


    if (
        !answer.recordingUrl
    ) {
        throw new Error(
            "Recording not found"
        );
    }


    const url =
        await generatePresignedGetUrl(
            answer.recordingUrl
        );


    return {
        url,
    };
};