import Groq from "groq-sdk";
import dotenv from "dotenv";
import { and, asc, eq } from "drizzle-orm";

import { db } from "../db";

import {
    profiles,
    sessions,
    universities,
    courses,
    questionSets,
    questions,
} from "../db/schema";

import { extractDocumentText } from "./documentServices";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model =
    process.env.GROQ_FEEDBACK_MODEL ||
    "openai/gpt-oss-20b";

export const generateNextInterviewQuestion =
    async (
        userId: string,
        sessionId: string
    ) => {
        if (!process.env.GROQ_API_KEY) {
            throw new Error(
                "GROQ_API_KEY is not configured"
            );
        }

        // 1. Get session
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
            throw new Error(
                "Session not found"
            );
        }

        // 2. Get student profile
        const [profile] = await db
            .select()
            .from(profiles)
            .where(
                eq(profiles.userId, userId)
            )
            .limit(1);

        // 3. Get university
        let university = null;

        if (session.universityId) {
            const [result] = await db
                .select()
                .from(universities)
                .where(
                    eq(
                        universities.id,
                        session.universityId
                    )
                )
                .limit(1);

            university = result ?? null;
        }

        // 4. Get course
        let course = null;

        if (session.courseId) {
            const [result] = await db
                .select()
                .from(courses)
                .where(
                    eq(
                        courses.id,
                        session.courseId
                    )
                )
                .limit(1);

            course = result ?? null;
        }

        // 5. Get question set
        let questionSet = null;

        if (session.questionSetId) {
            const [result] = await db
                .select()
                .from(questionSets)
                .where(
                    eq(
                        questionSets.id,
                        session.questionSetId
                    )
                )
                .limit(1);

            questionSet = result ?? null;
        }

        // 6. Get CSV/admin questions
        let questionBank: Array<
            typeof questions.$inferSelect
        > = [];

        if (questionSet) {
            questionBank = await db
                .select()
                .from(questions)
                .where(
                    and(
                        eq(
                            questions.questionSetId,
                            questionSet.id
                        ),
                        eq(
                            questions.isActive,
                            true
                        )
                    )
                )
                .orderBy(
                    asc(questions.orderIndex)
                );
        }

        // 7. Extract CV
        let cvText = "";

        if (profile?.cvFileUrl) {
            cvText =
                await extractDocumentText(
                    profile.cvFileUrl
                );
        }

        // 8. Prepare question bank
        const questionBankText =
            questionBank
                .map(
                    (q, index) =>
                        `${index + 1}. ${q.text}
Type: ${q.typeTag ?? "general"}
Difficulty: ${q.difficulty}
Frequency: ${q.frequency}`
                )
                .join("\n\n");

        // 9. Ask Groq
        const completion =
            await groq.chat.completions.create({
                model,

                temperature: 0.4,

                response_format: {
                    type: "json_object",
                },

                messages: [
                    {
                        role: "system",
                        content: `
You are a university admission interviewer.

Generate exactly ONE interview question.

Use:
- student's CV
- academic background
- personal statement
- university
- course
- interview format
- administrator question bank

The administrator question bank provides the
foundation, but personalize the question using
the student's actual information.

Never invent information about the student.

Do not ask multiple questions.

Return JSON only:

{
  "question": "string",
  "type": "motivational | subject_knowledge | situational | ethical | personal_statement_probe | gap_career_change"
}
                        `.trim(),
                    },

                    {
                        role: "user",
                        content: `
STUDENT INFORMATION

Academic Background:
${profile?.academicBackgroundText ?? "Not provided"}

Personal Statement:
${profile?.personalStatementText ?? "Not provided"}

Bio:
${profile?.bio ?? "Not provided"}

Concerns:
${profile?.concernsText ?? "Not provided"}


CV

${cvText || "No CV available"}


UNIVERSITY

Name:
${university?.name ?? "Not provided"}

Country:
${university?.country ?? "Not provided"}

Interview Overview:
${university?.interviewOverview ?? "Not provided"}


COURSE

Name:
${course?.name ?? "Not provided"}

Track:
${course?.track ?? "Not provided"}

Interview Format:
${course?.interviewFormat ?? "Not provided"}

Duration:
${course?.durationMins ?? "Not provided"}

Panel Size:
${course?.panelSize ?? "Not provided"}


QUESTION BANK

${questionBankText || "No questions available"}
                        `.trim(),
                    },
                ],
            });

        const content =
            completion.choices[0]
                ?.message?.content;

        if (!content) {
            throw new Error(
                "Groq returned an empty question"
            );
        }

        let result: {
            question?: string;
            type?: string;
        };

        try {
            result = JSON.parse(content);
        } catch {
            throw new Error(
                "Groq returned invalid JSON"
            );
        }

        if (!result.question) {
            throw new Error(
                "Groq did not return a question"
            );
        }

        return {
            question: result.question,
            type:
                result.type ??
                "motivational",
        };
    };