import crypto from "crypto";

import { eq, and } from "drizzle-orm";

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

import { uploadAudio } from "./storageServices";


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


export const getUserSessions = async (
    userId: string
) => {
    const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId));

    return userSessions;
};


export const getSessionById = async (
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
        );

    if (!session) {
        throw new Error("Session not found");
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

    const [feedbackReport] = await db
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


export const createSessionAnswer = async (
    userId: string,
    sessionId: string,
    questionId: string,
    audioBuffer: Buffer,
    contentType: string,
    durationSeconds?: number
) => {

    // 1. Check that the session belongs to the logged-in user
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


    // 2. Check that the question exists
    const [question] = await db
        .select()
        .from(questions)
        .where(
            eq(
                questions.id,
                questionId
            )
        );

    if (!question) {
        throw new Error("Question not found");
    }


    // 3. Generate unique object-storage key
    const extension =
        contentType.split("/")[1] || "webm";

    const key =
        `sessions/${sessionId}/answers/${crypto.randomUUID()}.${extension}`;


    // 4. Upload audio to MinIO/S3
    await uploadAudio(
        key,
        audioBuffer,
        contentType
    );


    // 5. Create answer database record
    const [answer] = await db
        .insert(sessionAnswers)
        .values({
            sessionId,
            questionId,
            recordingUrl: key,
            durationSeconds:
                durationSeconds ?? null,
        })
        .returning();


    return answer;
};