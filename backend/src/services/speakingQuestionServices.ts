import Groq from "groq-sdk";
import dotenv from "dotenv";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
    sessions,
    sessionQuestions,
    sessionAnswers,
} from "../db/schema";
import { AppError } from "../utils/AppError";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model =
    process.env.GROQ_FEEDBACK_MODEL ||
    "openai/gpt-oss-20b";

const TOTAL_SPEAKING_QUESTIONS = 3;

export const generateSpeakingQuestion = async (
    userId: string,
    sessionId: string
) => {
    if (!process.env.GROQ_API_KEY) {
        throw new AppError(
            "GROQ_API_KEY is not configured",
            500,
            "GROQ_CONFIGURATION_ERROR"
        );
    }

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
        throw new AppError(
            "Session not found",
            404,
            "SESSION_NOT_FOUND"
        );
    }

    if (session.module !== "speaking") {
        throw new AppError(
            "This session is not a speaking session",
            400,
            "INVALID_SESSION_MODULE"
        );
    }

    if (session.status !== "in_progress") {
        throw new AppError(
            "Session is no longer in progress",
            400,
            "SESSION_NOT_IN_PROGRESS"
        );
    }

    let existingQuestions = await db
        .select()
        .from(sessionQuestions)
        .where(
            eq(
                sessionQuestions.sessionId,
                sessionId
            )
        );

    if (
        existingQuestions.length <
        TOTAL_SPEAKING_QUESTIONS
    ) {
        let completion;

        try {
            completion =
                await groq.chat.completions.create({
                    model,
                    temperature: 0.8,
                    response_format: {
                        type: "json_object",
                    },
                    messages: [
                        {
                            role: "system",
                            content: `
You are an expert IELTS Speaking examiner.

Generate exactly THREE IELTS Speaking Part 2 cue cards.

Each cue card must be realistic and similar in style
to authentic IELTS Speaking Part 2 questions.

The topics should be appropriate for an international
English proficiency examination.

Avoid highly technical, controversial, political,
violent, or overly personal topics.

Each topic should allow the candidate to speak naturally
for approximately 1 to 2 minutes.

For EACH cue card include:

1. One clear "Describe..." topic.
2. Exactly 4 simple bullet point prompts.
3. The fourth prompt must ask the candidate to explain
   something related to their feelings, opinion,
   importance, or experience.

Make all three topics DIFFERENT from each other.

Do not repeat the same topic.

Do not generate answers.

Do not include explanations.

Return JSON only.

Use exactly this structure:

{
    "questions": [
        {
            "question": "Describe ...",
            "instructions": [
                "first prompt",
                "second prompt",
                "third prompt",
                "and explain ..."
            ]
        },
        {
            "question": "Describe ...",
            "instructions": [
                "first prompt",
                "second prompt",
                "third prompt",
                "and explain ..."
            ]
        },
        {
            "question": "Describe ...",
            "instructions": [
                "first prompt",
                "second prompt",
                "third prompt",
                "and explain ..."
            ]
        }
    ]
}
                            `.trim(),
                        },
                        {
                            role: "user",
                            content: `
Generate three fresh IELTS Speaking Part 2 cue cards.

Make the topics natural, interesting, and suitable
for an international IELTS speaking practice session.

The three topics must be clearly different.

Avoid repeating extremely common examples such as:

- Describe your best friend
- Describe a person who influenced you
- Describe your favorite book
- Describe a memorable trip

Return JSON only.
                            `.trim(),
                        },
                    ],
                });
        } catch (error) {
            console.error(
                "Groq speaking question generation failed:",
                error
            );

            throw new AppError(
                "Failed to generate speaking questions",
                502,
                "GROQ_GENERATION_ERROR"
            );
        }

        const content =
            completion.choices[0]?.message?.content;

        if (!content) {
            throw new AppError(
                "Groq returned empty speaking questions",
                502,
                "EMPTY_GROQ_RESPONSE"
            );
        }

        let result: {
            questions?: Array<{
                question?: string;
                instructions?: string[];
            }>;
        };

        try {
            result = JSON.parse(content);
        } catch {
            throw new AppError(
                "Groq returned invalid JSON",
                502,
                "INVALID_GROQ_JSON"
            );
        }

        if (
            !Array.isArray(result.questions) ||
            result.questions.length !==
                TOTAL_SPEAKING_QUESTIONS
        ) {
            throw new AppError(
                "Groq did not return exactly 3 speaking questions",
                502,
                "INVALID_GROQ_QUESTIONS"
            );
        }

        for (
            const speakingQuestion
            of result.questions
        ) {
            if (
                typeof speakingQuestion.question !==
                    "string" ||
                !speakingQuestion.question.trim()
            ) {
                throw new AppError(
                    "Groq returned an invalid speaking question",
                    502,
                    "INVALID_GROQ_QUESTION"
                );
            }

            if (
                !Array.isArray(
                    speakingQuestion.instructions
                ) ||
                speakingQuestion.instructions.length !==
                    4 ||
                speakingQuestion.instructions.some(
                    (item) =>
                        typeof item !== "string" ||
                        !item.trim()
                )
            ) {
                throw new AppError(
                    "Groq returned invalid cue card instructions",
                    502,
                    "INVALID_GROQ_INSTRUCTIONS"
                );
            }
        }

        for (
            let index = 0;
            index < result.questions.length;
            index++
        ) {
            const speakingQuestion =
                result.questions[index];

            await db
                .insert(sessionQuestions)
                .values({
                    sessionId,
                    text:
                        speakingQuestion.question!.trim(),
                    content: {
                        instructions:
                            speakingQuestion.instructions!.map(
                                (item) =>
                                    item.trim()
                            ),
                    },
                    type: "subject_knowledge",
                    orderIndex: index + 1,
                })
                .onConflictDoNothing({
                    target: [
                        sessionQuestions.sessionId,
                        sessionQuestions.orderIndex,
                    ],
                });
        }

        existingQuestions = await db
            .select()
            .from(sessionQuestions)
            .where(
                eq(
                    sessionQuestions.sessionId,
                    sessionId
                )
            );
    }

    const questions = existingQuestions
        .sort(
            (a, b) =>
                a.orderIndex -
                b.orderIndex
        )
        .slice(
            0,
            TOTAL_SPEAKING_QUESTIONS
        );

    if (
        questions.length !==
        TOTAL_SPEAKING_QUESTIONS
    ) {
        throw new AppError(
            "Speaking session does not contain all 3 questions",
            500,
            "INCOMPLETE_SPEAKING_QUESTIONS"
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

    const answeredQuestionIds =
        new Set(
            answers
                .filter(
                    (answer) =>
                        answer.questionId
                )
                .map(
                    (answer) =>
                        answer.questionId
                )
        );

    const nextQuestion =
        questions.find(
            (item) =>
                !answeredQuestionIds.has(
                    item.id
                )
        );

    if (!nextQuestion) {
        throw new AppError(
            "All speaking questions have already been completed",
            400,
            "SPEAKING_QUESTIONS_COMPLETED"
        );
    }

    const content =
        nextQuestion.content as {
            instructions?: string[];
        } | null;

    return {
        questionId:
            nextQuestion.id,
        question:
            nextQuestion.text,
        instructions:
            content?.instructions || [],
        type:
            nextQuestion.type,
        orderIndex:
            nextQuestion.orderIndex,
        totalQuestions:
            TOTAL_SPEAKING_QUESTIONS,
        isLastQuestion:
            nextQuestion.orderIndex ===
            TOTAL_SPEAKING_QUESTIONS,
    };
};