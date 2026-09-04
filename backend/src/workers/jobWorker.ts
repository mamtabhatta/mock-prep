
import crypto from "crypto";
import { Worker, Job, Queue } from "bullmq";
import IORedis from "ioredis";
import { db } from "../db";
import {
    sessions,
    sessionAnswers,
    feedbackReports,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { downloadObject } from "../services/storageServices";
import { transcribeWithGroq } from "../services/groqServices";
import {
    generateFeedbackWithGroq,
    generateSpeakingFeedbackWithGroq,
} from "../services/feedbackServices";

const QUEUE_NAME = "mock-prep-jobs";

const redisUrl =
    process.env.REDIS_URL ||
    "redis://localhost:6380";

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
});

const interviewFormats = [
    "Panel",
    "1-on-1",
    "MMI",
] as const;

type InterviewFormat =
    (typeof interviewFormats)[number];

const queueFeedbackIfReady = async (
    sessionId: string
) => {
    const sessionResult = await db
        .select({
            id: sessions.id,
            status: sessions.status,
        })
        .from(sessions)
        .where(
            eq(
                sessions.id,
                sessionId
            )
        )
        .limit(1);

    if (!sessionResult.length) {
        return;
    }

    const session = sessionResult[0];

    if (session.status !== "submitted") {
        return;
    }

    const answers = await db
        .select({
            id: sessionAnswers.id,
            transcriptionStatus:
                sessionAnswers.transcriptionStatus,
        })
        .from(sessionAnswers)
        .where(
            eq(
                sessionAnswers.sessionId,
                sessionId
            )
        );

    if (!answers.length) {
        return;
    }

    const allCompleted = answers.every(
        (answer) =>
            answer.transcriptionStatus ===
            "completed"
    );

    if (!allCompleted) {
        return;
    }

    console.log(
        `All ${answers.length} answer(s) are ready.`
    );

    const existingFeedback = await db
        .select({
            id: feedbackReports.id,
        })
        .from(feedbackReports)
        .where(
            eq(
                feedbackReports.sessionId,
                sessionId
            )
        )
        .limit(1);

    if (existingFeedback.length) {
        console.log(
            `Feedback already exists for session ${sessionId}`
        );

        return;
    }

    const feedbackQueue = new Queue(
        QUEUE_NAME,
        {
            connection,
        }
    );

    await feedbackQueue.add(
        "generate-feedback",
        {
            sessionId,
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        }
    );

    await feedbackQueue.close();

    console.log(
        `Feedback job queued for session ${sessionId}`
    );
};

const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
        console.log(
            "================================="
        );

        console.log(
            `PROCESSING JOB: ${job.id}`
        );

        console.log(
            `JOB NAME: ${job.name}`
        );

        console.log(
            "JOB DATA:",
            job.data
        );

        console.log(
            "================================="
        );

        if (
            job.name ===
            "transcribe-answer"
        ) {
            const sessionAnswerId =
                job.data.sessionAnswerId ||
                job.data.answerId;

            const sessionId =
                job.data.sessionId;

            const storageKey =
                job.data.storageKey ||
                job.data.recordingUrl;

            if (
                !sessionAnswerId ||
                !sessionId ||
                !storageKey
            ) {
                throw new Error(
                    "Missing transcription job data"
                );
            }

            try {
                await db
                    .update(
                        sessionAnswers
                    )
                    .set({
                        transcriptionStatus:
                            "processing",
                    })
                    .where(
                        eq(
                            sessionAnswers.id,
                            sessionAnswerId
                        )
                    );

                const audioBuffer =
                    await downloadObject(
                        storageKey
                    );

                const transcript =
                    await transcribeWithGroq(
                        audioBuffer,
                        storageKey
                    );

                await db
                    .update(
                        sessionAnswers
                    )
                    .set({
                        transcript,
                        transcriptionStatus:
                            "completed",
                    })
                    .where(
                        eq(
                            sessionAnswers.id,
                            sessionAnswerId
                        )
                    );

                console.log(
                    `Transcription completed for answer ${sessionAnswerId}`
                );

                await queueFeedbackIfReady(
                    sessionId
                );

                return {
                    success: true,
                    sessionAnswerId,
                    sessionId,
                };
            } catch (error) {
                console.error(
                    `Transcription failed for answer ${sessionAnswerId}:`,
                    error
                );

                await db
                    .update(
                        sessionAnswers
                    )
                    .set({
                        transcriptionStatus:
                            "failed",
                    })
                    .where(
                        eq(
                            sessionAnswers.id,
                            sessionAnswerId
                        )
                    );

                throw error;
            }
        }

        if (
            job.name ===
            "generate-feedback"
        ) {
            const { sessionId } =
                job.data as {
                    sessionId: string;
                };

            if (!sessionId) {
                throw new Error(
                    "Missing sessionId for feedback job"
                );
            }

            const sessionResult =
                await db
                    .select({
                        id: sessions.id,
                        status:
                            sessions.status,
                        module:
                            sessions.module,
                        interviewFormat:
                            sessions.interviewFormat,
                    })
                    .from(sessions)
                    .where(
                        eq(
                            sessions.id,
                            sessionId
                        )
                    )
                    .limit(1);

            if (
                !sessionResult.length
            ) {
                throw new Error(
                    `Session not found: ${sessionId}`
                );
            }

            const session =
                sessionResult[0];

            console.log(
                "Session found:",
                session
            );

            if (
                session.status ===
                "ai_reviewed"
            ) {
                console.log(
                    `Session ${sessionId} already has feedback`
                );

                return {
                    success: true,
                    skipped: true,
                    reason:
                        "already_reviewed",
                };
            }

            if (
                session.status !==
                "submitted"
            ) {
                console.log(
                    `Skipping feedback for session ${sessionId}. Status: ${session.status}`
                );

                return {
                    success: true,
                    skipped: true,
                    reason:
                        "invalid_status",
                };
            }

            const answers =
                await db
                    .select({
                        id:
                            sessionAnswers.id,
                        questionId:
                            sessionAnswers.questionId,
                        transcript:
                            sessionAnswers.transcript,
                        durationSeconds:
                            sessionAnswers.durationSeconds,
                        transcriptionStatus:
                            sessionAnswers.transcriptionStatus,
                    })
                    .from(
                        sessionAnswers
                    )
                    .where(
                        eq(
                            sessionAnswers.sessionId,
                            sessionId
                        )
                    );

            if (!answers.length) {
                throw new Error(
                    `No answers found for session ${sessionId}`
                );
            }

            console.log(
                `Found ${answers.length} answer(s) for session ${sessionId}`
            );

            const incompleteAnswers =
                answers.filter(
                    (answer) =>
                        answer.transcriptionStatus !==
                            "completed" ||
                        !answer.transcript
                );

            if (
                incompleteAnswers.length
            ) {
                throw new Error(
                    `Not all answers have completed transcripts for session ${sessionId}`
                );
            }

            if (
                session.module ===
                "speaking"
            ) {
                const speakingAnswers =
                    answers
                        .sort(
                            (a, b) =>
                                (
                                    a.questionId ||
                                    ""
                                ).localeCompare(
                                    b.questionId ||
                                        ""
                                )
                        )
                        .map(
                            (answer) => ({
                                questionId:
                                    answer.questionId,
                                transcript:
                                    answer.transcript!,
                                durationSeconds:
                                    answer.durationSeconds ??
                                    0,
                            })
                        );

                if (
                    !speakingAnswers.length
                ) {
                    throw new Error(
                        `No speaking answers found for session ${sessionId}`
                    );
                }

                console.log(
                    `Generating speaking feedback from ${speakingAnswers.length} answer(s)`
                );

                const feedback =
                    await generateSpeakingFeedbackWithGroq(
                        speakingAnswers
                    );

                await db
                    .insert(
                        feedbackReports
                    )
                    .values({
                        id:
                            crypto.randomUUID(),
                        sessionId,
                        aiFeedbackJson:
                            feedback,
                    });

                await db
                    .update(
                        sessions
                    )
                    .set({
                        status:
                            "ai_reviewed",
                    })
                    .where(
                        eq(
                            sessions.id,
                            sessionId
                        )
                    );

                console.log(
                    `Speaking feedback generated successfully for session ${sessionId}`
                );

                return {
                    success: true,
                    sessionId,
                    module:
                        session.module,
                    answerCount:
                        speakingAnswers.length,
                };
            }

            if (
                session.module ===
                "interview"
            ) {
                if (
                    !session.interviewFormat ||
                    !interviewFormats.includes(
                        session.interviewFormat as InterviewFormat
                    )
                ) {
                    throw new Error(
                        `Invalid interview format: ${session.interviewFormat}`
                    );
                }

                const interviewFormat =
                    session.interviewFormat as InterviewFormat;

                const feedback =
                    await generateFeedbackWithGroq(
                        {
                            interviewFormat,
                            transcripts:
                                answers.map(
                                    (
                                        answer
                                    ) => ({
                                        questionId:
                                            answer.questionId,
                                        transcript:
                                            answer.transcript!,
                                    })
                                ),
                        }
                    );

                await db
                    .insert(
                        feedbackReports
                    )
                    .values({
                        id:
                            crypto.randomUUID(),
                        sessionId,
                        aiFeedbackJson:
                            feedback,
                    });

                await db
                    .update(
                        sessions
                    )
                    .set({
                        status:
                            "ai_reviewed",
                    })
                    .where(
                        eq(
                            sessions.id,
                            sessionId
                        )
                    );

                console.log(
                    `Interview feedback generated for session ${sessionId} (${interviewFormat})`
                );

                return {
                    success: true,
                    sessionId,
                    module:
                        session.module,
                    interviewFormat,
                };
            }

            throw new Error(
                `Unsupported session module: ${session.module}`
            );
        }

        throw new Error(
            `Unknown job type: ${job.name}`
        );
    },
    {
        connection,
        concurrency: 1,
    }
);

worker.on(
    "failed",
    async (job, error) => {
        console.error(
            `Job ${job?.id} failed:`,
            error
        );

        if (!job) {
            return;
        }

        if (
            job.attemptsMade >=
            (job.opts.attempts || 1)
        ) {
            const sessionId =
                job.data?.sessionId;

            if (!sessionId) {
                return;
            }

            try {
                const sessionResult =
                    await db
                        .select({
                            status:
                                sessions.status,
                            module:
                                sessions.module,
                        })
                        .from(
                            sessions
                        )
                        .where(
                            eq(
                                sessions.id,
                                sessionId
                            )
                        )
                        .limit(1);

                if (
                    sessionResult.length &&
                    sessionResult[0].status ===
                        "in_progress" &&
                    sessionResult[0].module ===
                        "interview"
                ) {
                    await db
                        .update(
                            sessions
                        )
                        .set({
                            status:
                                "failed",
                        })
                        .where(
                            eq(
                                sessions.id,
                                sessionId
                            )
                        );
                }
            } catch (
                updateError
            ) {
                console.error(
                    "Failed to update session status:",
                    updateError
                );
            }
        }
    }
);

worker.on(
    "error",
    (error) => {
        console.error(
            "Worker error:",
            error
        );
    }
);

worker.on(
    "completed",
    (job) => {
        console.log(
            `Job ${job.id} (${job.name}) completed`
        );
    }
);

console.log(
    `Worker started for queue: ${QUEUE_NAME}`
);

