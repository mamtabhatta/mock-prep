import {
    Worker,
} from "bullmq";

import dotenv from "dotenv";

import {
    eq,
} from "drizzle-orm";

import {
    db,
} from "../db";

import {
    sessionAnswers,
} from "../db/schema";

import {
    downloadObject,
} from "../services/storageServices";

import {
    transcribeWithGroq,
} from "../services/groqServices";

dotenv.config();

const redisUrl =
    process.env.REDIS_URL ||
    "redis://localhost:6380";

const redis =
    new URL(redisUrl);

const jobWorker =
    new Worker(
        "mock-prep-jobs",

        async (job) => {
            console.log(
                "================================="
            );

            console.log(
                "PROCESSING JOB:",
                job.id
            );

            console.log(
                "JOB NAME:",
                job.name
            );

            console.log(
                "JOB DATA:",
                job.data
            );

            console.log(
                "================================="
            );

            if (
                job.name !==
                "transcribe-answer"
            ) {
                return {
                    success: true,
                    processed: true,
                    jobId: job.id,
                };
            }

            const {
                answerId,
                recordingUrl,
            } = job.data as {
                answerId: string;
                sessionId: string;
                recordingUrl: string;
                contentType: string;
            };

            console.log(
                "ANSWER ID:",
                answerId
            );

            console.log(
                "RECORDING URL:",
                recordingUrl
            );

            console.log(
                "RECORDING URL TYPE:",
                typeof recordingUrl
            );

            if (!answerId) {
                throw new Error(
                    "Job is missing answerId"
                );
            }

            if (!recordingUrl) {
                throw new Error(
                    "Job is missing recordingUrl"
                );
            }

            await db
                .update(sessionAnswers)
                .set({
                    transcriptionStatus:
                        "processing",
                })
                .where(
                    eq(
                        sessionAnswers.id,
                        answerId
                    )
                );

            try {
                console.log(
                    "Downloading audio from storage..."
                );

                const audioBuffer =
                    await downloadObject(
                        recordingUrl
                    );

                console.log(
                    "Audio downloaded successfully."
                );

                console.log(
                    "Audio size:",
                    audioBuffer.length,
                    "bytes"
                );

                const filename =
                    recordingUrl
                        .split("/")
                        .pop() ||
                    `${answerId}.webm`;

                console.log(
                    "Filename:",
                    filename
                );

                console.log(
                    "Sending audio to Groq..."
                );

                const transcript =
                    await transcribeWithGroq(
                        audioBuffer,
                        filename
                    );

                console.log(
                    "Groq transcription successful."
                );

                console.log(
                    "Transcript:",
                    transcript
                );

                await db
                    .update(sessionAnswers)
                    .set({
                        transcript,
                        transcriptionStatus:
                            "completed",
                    })
                    .where(
                        eq(
                            sessionAnswers.id,
                            answerId
                        )
                    );

                console.log(
                    "Database updated successfully."
                );

                return {
                    success: true,
                    answerId,
                    transcript,
                };
            } catch (error) {
                console.error(
                    "Transcription processing error:",
                    error
                );

                const maxAttempts =
                    job.opts.attempts ?? 1;

                const currentAttempt =
                    job.attemptsMade;

                const isFinalAttempt =
                    currentAttempt >=
                    maxAttempts - 1;

                await db
                    .update(sessionAnswers)
                    .set({
                        transcriptionStatus:
                            isFinalAttempt
                                ? "failed"
                                : "pending",
                    })
                    .where(
                        eq(
                            sessionAnswers.id,
                            answerId
                        )
                    );

                throw error;
            }
        },

        {
            connection: {
                host:
                    redis.hostname,

                port:
                    Number(
                        redis.port
                    ),
            },

            concurrency: 1,
        }
    );

jobWorker.on(
    "completed",
    (job) => {
        console.log(
            `Job ${job.id} completed`
        );
    }
);

jobWorker.on(
    "failed",
    (job, error) => {
        console.error(
            `Job ${job?.id} failed:`,
            error.message
        );
    }
);

jobWorker.on(
    "error",
    (error) => {
        console.error(
            "Worker error:",
            error
        );
    }
);

console.log(
    "Job worker started"
);