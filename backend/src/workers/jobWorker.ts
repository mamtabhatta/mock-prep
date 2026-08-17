import { Worker, Queue } from "bullmq";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";

import { db } from "../db";
import {
    sessionAnswers,
    feedbackReports,
    sessions,
} from "../db/schema";

import { downloadObject } from "../services/storageServices";
import { transcribeWithGroq } from "../services/groqServices";
import { generateFeedbackWithGroq } from "../services/feedbackServices";
import { notifyJobFailure } from "../services/notificationServices";

dotenv.config();

const redisUrl =
    process.env.REDIS_URL || "redis://localhost:6380";

const redis = new URL(redisUrl);

const redisConnection = {
    host: redis.hostname,
    port: Number(redis.port),
};

const jobQueue = new Queue("mock-prep-jobs", {
    connection: redisConnection,
});

const jobWorker = new Worker(
    "mock-prep-jobs",
    async (job) => {
        console.log("=================================");
        console.log("PROCESSING JOB:", job.id);
        console.log("JOB NAME:", job.name);
        console.log("JOB DATA:", job.data);
        console.log(
            "ATTEMPT:",
            job.attemptsMade + 1,
            "/",
            job.opts.attempts ?? 1
        );
        console.log("=================================");

        if (job.name === "transcribe-answer") {
            const {
                answerId,
                sessionId,
                recordingUrl,
            } = job.data as {
                answerId: string;
                sessionId: string;
                recordingUrl: string;
                contentType: string;
            };

            console.log("ANSWER ID:", answerId);
            console.log("SESSION ID:", sessionId);
            console.log("RECORDING URL:", recordingUrl);
            console.log(
                "RECORDING URL TYPE:",
                typeof recordingUrl
            );

            if (!answerId) {
                throw new Error("Job is missing answerId");
            }

            if (!sessionId) {
                throw new Error("Job is missing sessionId");
            }

            if (!recordingUrl) {
                throw new Error(
                    "Job is missing recordingUrl"
                );
            }

            await db
                .update(sessionAnswers)
                .set({
                    transcriptionStatus: "processing",
                })
                .where(
                    eq(sessionAnswers.id, answerId)
                );

            try {
                console.log(
                    "Downloading audio from storage..."
                );

                const audioBuffer =
                    await downloadObject(recordingUrl);

                console.log(
                    "Audio downloaded successfully."
                );

                console.log(
                    "Audio size:",
                    audioBuffer.length,
                    "bytes"
                );

                const filename =
                    recordingUrl.split("/").pop() ||
                    `${answerId}.webm`;

                console.log("Filename:", filename);
                console.log("Sending audio to Groq...");

                const transcript =
                    await transcribeWithGroq(
                        audioBuffer,
                        filename
                    );

                console.log(
                    "Groq transcription successful."
                );

                console.log("Transcript:", transcript);

                await db
                    .update(sessionAnswers)
                    .set({
                        transcript,
                        transcriptionStatus: "completed",
                    })
                    .where(
                        eq(sessionAnswers.id, answerId)
                    );

                console.log(
                    "Database updated successfully."
                );

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

                console.log(
                    "Total answers in session:",
                    answers.length
                );

                const allCompleted =
                    answers.length > 0 &&
                    answers.every(
                        (answer) =>
                            answer.transcriptionStatus ===
                            "completed"
                    );

                console.log(
                    "All answers completed:",
                    allCompleted
                );

                if (allCompleted) {
                    console.log(
                        "All transcripts completed."
                    );

                    console.log(
                        "Queueing generate-feedback job..."
                    );

                    await jobQueue.add(
                        "generate-feedback",
                        { sessionId },
                        {
                            jobId:
                                `generate-feedback-${sessionId}`,
                            attempts: 3,
                            backoff: {
                                type: "exponential",
                                delay: 2000,
                            },
                            removeOnComplete: true,
                            removeOnFail: false,
                        }
                    );

                    console.log(
                        "generate-feedback job queued."
                    );
                }

                return {
                    success: true,
                    answerId,
                    sessionId,
                    transcript,
                    allCompleted,
                };
            } catch (error) {
                console.error(
                    "Transcription processing error:",
                    error
                );

                throw error;
            }
        }

        if (job.name === "generate-feedback") {
            const { sessionId } = job.data as {
                sessionId: string;
            };

            console.log("=================================");
            console.log("GENERATING AI FEEDBACK");
            console.log("SESSION ID:", sessionId);
            console.log("=================================");

            if (!sessionId) {
                throw new Error(
                    "generate-feedback job is missing sessionId"
                );
            }

            const answers = await db
                .select({
                    questionId:
                        sessionAnswers.questionId,
                    transcript:
                        sessionAnswers.transcript,
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

            console.log(
                "Answers found:",
                answers.length
            );

            const completedAnswers =
                answers.filter(
                    (answer) =>
                        answer.transcriptionStatus ===
                            "completed" &&
                        answer.transcript &&
                        answer.transcript.trim().length > 0
                );

            console.log(
                "Completed transcripts:",
                completedAnswers.length
            );

            if (completedAnswers.length === 0) {
                throw new Error(
                    `No completed transcripts found for session ${sessionId}`
                );
            }

            const allCompleted =
                answers.length > 0 &&
                answers.every(
                    (answer) =>
                        answer.transcriptionStatus ===
                        "completed"
                );

            if (!allCompleted) {
                throw new Error(
                    `Not all answers are transcribed for session ${sessionId}`
                );
            }

            console.log(
                "Sending all transcripts to Groq LLM..."
            );

            const feedback =
                await generateFeedbackWithGroq(
                    completedAnswers.map(
                        (answer) => ({
                            questionId:
                                answer.questionId,
                            transcript:
                                answer.transcript!,
                        })
                    )
                );

            console.log(
                "Groq feedback generated successfully."
            );

            console.log(
                "Overall score:",
                feedback.overall_score
            );

            await db
                .insert(feedbackReports)
                .values({
                    sessionId,
                    aiFeedbackJson: feedback,
                    scoresJson: {
                        overall_score:
                            feedback.overall_score,
                        answer_feedback:
                            feedback.answer_feedback,
                    },
                    status: "ai_reviewed",
                })
                .onConflictDoUpdate({
                    target:
                        feedbackReports.sessionId,
                    set: {
                        aiFeedbackJson: feedback,
                        scoresJson: {
                            overall_score:
                                feedback.overall_score,
                            answer_feedback:
                                feedback.answer_feedback,
                        },
                        status: "ai_reviewed",
                    },
                });

            console.log(
                "Feedback report saved successfully."
            );

            await db
                .update(sessions)
                .set({
                    status: "ai_reviewed",
                })
                .where(
                    eq(sessions.id, sessionId)
                );

            console.log(
                `Session ${sessionId} marked as ai_reviewed`
            );

            return {
                success: true,
                sessionId,
                overallScore:
                    feedback.overall_score,
            };
        }

        console.log(
            `Unknown job type: ${job.name}`
        );

        return {
            success: true,
            processed: false,
            jobId: job.id,
        };
    },
    {
        connection: redisConnection,
        concurrency: 1,
    }
);

jobWorker.on("completed", (job) => {
    console.log(
        `Job ${job.id} completed`
    );
});

jobWorker.on(
    "failed",
    async (job, error) => {
        console.error(
            `Job ${job?.id} failed:`,
            error.message
        );

        if (!job) {
            return;
        }

        const maxAttempts =
            job.opts.attempts ?? 1;

        const attemptsMade =
            job.attemptsMade;

        console.log(
            `Job ${job.id} attempt ${attemptsMade}/${maxAttempts}`
        );

        if (attemptsMade < maxAttempts) {
            console.log(
                `Job ${job.id} will be retried.`
            );
            return;
        }

        console.log(
            `Job ${job.id} reached maximum attempts.`
        );

        const {
            sessionId,
            answerId,
        } = job.data as {
            sessionId?: string;
            answerId?: string;
        };

        if (sessionId) {
            await db
                .update(sessions)
                .set({
                    status: "failed",
                })
                .where(
                    eq(sessions.id, sessionId)
                );

            console.log(
                `Session ${sessionId} marked as failed`
            );
        }

        if (
            job.name === "transcribe-answer" &&
            answerId
        ) {
            await db
                .update(sessionAnswers)
                .set({
                    transcriptionStatus: "failed",
                })
                .where(
                    eq(
                        sessionAnswers.id,
                        answerId
                    )
                );

            console.log(
                `Answer ${answerId} marked as failed`
            );
        }

        await notifyJobFailure({
            jobId: job.id,
            jobName: job.name,
            sessionId,
            answerId,
            error: error.message,
        });
    }
);

jobWorker.on("error", (error) => {
    console.error(
        "Worker error:",
        error
    );
});

console.log("Job worker started");