
import crypto from "crypto";

import { db, pool } from "../../db";
import { prompts } from "../../db/schema";
import { eq } from "drizzle-orm";

const mockTranscriptionCreate = jest.fn();
const mockChatCreate = jest.fn();

jest.mock("groq-sdk", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        audio: {
            transcriptions: {
                create: (...args: unknown[]) =>
                    mockTranscriptionCreate(...args),
            },
        },
        chat: {
            completions: {
                create: (...args: unknown[]) =>
                    mockChatCreate(...args),
            },
        },
    })),
}));

import * as groqServices from "../../services/groqServices";
import * as feedbackServices from "../../services/feedbackServices";

describe("Mocked Groq AI Services", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        process.env.GROQ_API_KEY = "test-groq-key";
        process.env.GROQ_WHISPER_MODEL = "whisper-large-v3";
        process.env.GROQ_FEEDBACK_MODEL = "openai/gpt-oss-20b";
    });

    afterAll(async () => {
        await pool.end();
    });

    describe("Groq transcription", () => {
        it("should transcribe audio using mocked Groq", async () => {
            mockTranscriptionCreate.mockResolvedValue({
                text: "I want to study in the UK because it provides excellent education.",
            });

            const audio = Buffer.from("fake audio data");

            const result =
                await groqServices.transcribeWithGroq(
                    audio,
                    "answer.webm"
                );

            expect(result).toBe(
                "I want to study in the UK because it provides excellent education."
            );

            expect(
                mockTranscriptionCreate
            ).toHaveBeenCalledTimes(1);

            expect(
                mockTranscriptionCreate
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: "whisper-large-v3",
                    response_format: "json",
                    temperature: 0,
                })
            );
        });

        it("should propagate Groq transcription errors", async () => {
            mockTranscriptionCreate.mockRejectedValue(
                new Error("Groq transcription failed")
            );

            const audio = Buffer.from("fake audio data");

            await expect(
                groqServices.transcribeWithGroq(
                    audio,
                    "answer.webm"
                )
            ).rejects.toThrow(
                "Groq transcription failed"
            );
        });
    });

    describe("Groq feedback", () => {
        let promptId: string;

        beforeEach(async () => {
            promptId = crypto.randomUUID();

            await db
                .update(prompts)
                .set({
                    isActive: false,
                })
                .where(
                    eq(
                        prompts.module,
                        "interview_feedback"
                    )
                );

            await db.insert(prompts).values({
                id: promptId,
                module: "interview_feedback",
                version: 999,
                isActive: true,
                contentText:
                    "TEST ACTIVE PROMPT: Evaluate clarity and credibility.",
            });
        });

        afterEach(async () => {
            await db
                .delete(prompts)
                .where(
                    eq(
                        prompts.id,
                        promptId
                    )
                );
        });

        it("should resolve the active prompt from the database", async () => {
            mockChatCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                overall_score: 85,
                                strengths: [
                                    "Clear answer",
                                ],
                                weaknesses: [
                                    "Could provide more detail",
                                ],
                                recommendations: [
                                    "Give specific examples",
                                ],
                                summary:
                                    "Good interview response.",
                                answer_feedback: [
                                    {
                                        question_id:
                                            "question-1",
                                        score: 85,
                                        feedback:
                                            "Clear and credible response.",
                                    },
                                ],
                            }),
                        },
                    },
                ],
            });

            const result =
                await feedbackServices.generateFeedbackWithGroq({
                    interviewFormat: "1-on-1",
                    transcripts: [
                        {
                            questionId: "question-1",
                            transcript:
                                "I chose this university because of its strong academic reputation.",
                        },
                    ],
                });

            expect(
                result.overall_score
            ).toBe(85);

            expect(
                mockChatCreate
            ).toHaveBeenCalledTimes(1);

            const call =
                mockChatCreate.mock.calls[0][0];

            expect(
                call.messages[0].content
            ).toContain(
                "TEST ACTIVE PROMPT: Evaluate clarity and credibility."
            );
        });

        it("should select the highest active prompt version", async () => {
            const secondPromptId =
                crypto.randomUUID();

            await db.insert(prompts).values({
                id: secondPromptId,
                module: "interview_feedback",
                version: 1000,
                isActive: true,
                contentText:
                    "TEST HIGHER VERSION PROMPT",
            });

            try {
                mockChatCreate.mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    overall_score: 90,
                                    strengths: [],
                                    weaknesses: [],
                                    recommendations: [],
                                    summary:
                                        "Test summary.",
                                    answer_feedback: [],
                                }),
                            },
                        },
                    ],
                });

                await feedbackServices.generateFeedbackWithGroq({
                    interviewFormat: "1-on-1",
                    transcripts: [
                        {
                            questionId: "question-1",
                            transcript:
                                "Test transcript",
                        },
                    ],
                });

                const call =
                    mockChatCreate.mock.calls[0][0];

                expect(
                    call.messages[0].content
                ).toContain(
                    "TEST HIGHER VERSION PROMPT"
                );
            } finally {
                await db
                    .delete(prompts)
                    .where(
                        eq(
                            prompts.id,
                            secondPromptId
                        )
                    );
            }
        });

        it("should send transcripts to mocked Groq", async () => {
            mockChatCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                overall_score: 75,
                                strengths: [
                                    "Relevant answer",
                                ],
                                weaknesses: [],
                                recommendations: [],
                                summary:
                                    "Good response.",
                                answer_feedback: [
                                    {
                                        question_id:
                                            "question-1",
                                        score: 75,
                                        feedback:
                                            "Good answer.",
                                    },
                                ],
                            }),
                        },
                    },
                ],
            });

            await feedbackServices.generateFeedbackWithGroq({
                interviewFormat: "1-on-1",
                transcripts: [
                    {
                        questionId: "question-1",
                        transcript:
                            "I selected this course because it matches my career goals.",
                    },
                ],
            });

            const call =
                mockChatCreate.mock.calls[0][0];

            expect(
                call.messages[1].content
            ).toContain(
                "I selected this course because it matches my career goals."
            );

            expect(
                call.messages[1].content
            ).toContain("question-1");
        });

        it("should fail when no active prompt exists", async () => {
            await db
                .update(prompts)
                .set({
                    isActive: false,
                })
                .where(
                    eq(
                        prompts.module,
                        "interview_feedback"
                    )
                );

            await expect(
                feedbackServices.generateFeedbackWithGroq({
                    interviewFormat: "1-on-1",
                    transcripts: [
                        {
                            questionId: "question-1",
                            transcript:
                                "Test transcript",
                        },
                    ],
                })
            ).rejects.toThrow(
                "No active prompt found for module: interview_feedback"
            );

            expect(
                mockChatCreate
            ).not.toHaveBeenCalled();
        });

        it("should propagate Groq feedback errors", async () => {
            mockChatCreate.mockRejectedValue(
                new Error("Groq feedback failed")
            );

            await expect(
                feedbackServices.generateFeedbackWithGroq({
                    interviewFormat: "1-on-1",
                    transcripts: [
                        {
                            questionId: "question-1",
                            transcript:
                                "Test transcript",
                        },
                    ],
                })
            ).rejects.toThrow(
                "Groq feedback failed"
            );
        });
    });
});

