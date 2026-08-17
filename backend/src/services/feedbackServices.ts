import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model =
    process.env.GROQ_FEEDBACK_MODEL ||
    "openai/gpt-oss-20b";

export type FeedbackInput = {
    questionId: string;
    transcript: string;
};

export type FeedbackResult = {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    summary: string;
    answer_feedback: {
        question_id: string;
        score: number;
        feedback: string;
    }[];
};

export const generateFeedbackWithGroq = async (
    transcripts: FeedbackInput[]
): Promise<FeedbackResult> => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error(
            "GROQ_API_KEY is not configured"
        );
    }

    if (!transcripts.length) {
        throw new Error(
            "No transcripts available for feedback"
        );
    }

    const transcriptText =
        transcripts
            .map(
                (item, index) =>
                    `Answer ${index + 1}
Question ID: ${item.questionId}
Transcript:
${item.transcript}`
            )
            .join("\n\n---\n\n");

    const completion =
        await groq.chat.completions.create({
            model,

            messages: [
                {
                    role: "system",
                    content: `
You are an expert interview evaluator.

Evaluate the candidate's complete set of answers.

You MUST evaluate all answers together in ONE assessment.

Return only structured JSON matching the supplied schema.

Be fair and constructive.
Scores must be integers from 0 to 100.
                    `.trim(),
                },
                {
                    role: "user",
                    content: `
Here are all of the candidate's transcripts:

${transcriptText}
                    `.trim(),
                },
            ],

            temperature: 0,

            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "interview_feedback",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            overall_score: {
                                type: "integer",
                                minimum: 0,
                                maximum: 100,
                            },

                            strengths: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                            },

                            weaknesses: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                            },

                            recommendations: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                            },

                            summary: {
                                type: "string",
                            },

                            answer_feedback: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        question_id: {
                                            type: "string",
                                        },
                                        score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },
                                        feedback: {
                                            type: "string",
                                        },
                                    },
                                    required: [
                                        "question_id",
                                        "score",
                                        "feedback",
                                    ],
                                    additionalProperties: false,
                                },
                            },
                        },

                        required: [
                            "overall_score",
                            "strengths",
                            "weaknesses",
                            "recommendations",
                            "summary",
                            "answer_feedback",
                        ],

                        additionalProperties: false,
                    },
                },
            },
        });

    const content =
        completion.choices[0]?.message?.content;

    if (!content) {
        throw new Error(
            "Groq returned an empty feedback response"
        );
    }

    return JSON.parse(content) as FeedbackResult;
};