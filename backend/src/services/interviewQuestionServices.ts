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
    sessionQuestions,
} from "../db/schema";

import { extractDocumentText } from "./documentServices";
import { AppError } from "../utils/AppError";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model =
    process.env.GROQ_FEEDBACK_MODEL ||
    "openai/gpt-oss-20b";

const MAX_QUESTIONS = 5;

const allowedTypes = [
    "motivational",
    "subject_knowledge",
    "situational",
    "ethical",
    "personal_statement_probe",
    "gap_career_change",
] as const;

type QuestionType =
    typeof allowedTypes[number];


// ============================================
// INTERVIEW FORMAT
// ============================================

const allowedInterviewFormats = [
    "Panel",
    "1-on-1",
    "MMI",
] as const;

type InterviewFormat =
    typeof allowedInterviewFormats[number];


// ============================================
// FORMAT INSTRUCTIONS
// ============================================

const getInterviewFormatInstructions = (
    format: InterviewFormat
) => {

    switch (format) {

        // ========================================
        // PANEL
        // ========================================

        case "Panel":

            return `
INTERVIEW FORMAT: PANEL

You are conducting a formal university admissions panel interview.

The candidate is being assessed by multiple interviewers.

The interview should feel:

- formal
- structured
- professional
- academically focused
- evaluative

The questions should collectively represent different perspectives that a panel might assess.

Across the interview, explore areas such as:

- academic suitability
- motivation
- course understanding
- academic preparation
- problem solving
- communication
- adaptability
- experience
- career goals
- study-abroad readiness

Do not make every question sound as if it comes from the same interviewer.

Different questions may naturally represent different panel perspectives, such as:

- academic interviewer
- subject interviewer
- admissions interviewer
- behavioral interviewer
- career-focused interviewer

However, ask exactly ONE question at a time.

Do not literally say "another panel member asks" or add interviewer labels.

The final question should simply sound like a professional interviewer speaking to the candidate.

Avoid making the interview feel like a casual conversation.
`.trim();


        // ========================================
        // ONE-ON-ONE
        // ========================================

        case "1-on-1":

            return `
INTERVIEW FORMAT: ONE-ON-ONE

You are conducting a traditional one-on-one university admissions interview.

There is one interviewer and one candidate.

The interview should feel:

- natural
- conversational
- professional
- personal
- connected from one question to the next

Use previous questions to understand what has already been discussed.

Where appropriate, explore a topic more deeply instead of abruptly changing subjects.

Questions may naturally follow from the candidate's previous discussion.

For example, if the candidate has discussed a project, the next question may explore what they learned from that experience.

However:

- do not repeat questions
- do not ask multiple questions at once
- do not force a follow-up when another topic is more appropriate

The interview should feel like a genuine conversation with an admissions interviewer.
`.trim();


        // ========================================
        // MMI
        // ========================================

        case "MMI":

            return `
INTERVIEW FORMAT: MMI

You are conducting a Multiple Mini Interview (MMI).

Each question represents an independent interview station.

The purpose is to assess the candidate's:

- ethical reasoning
- situational judgement
- communication
- empathy
- professionalism
- critical thinking
- decision making
- problem solving
- adaptability

MMI questions should frequently use realistic hypothetical situations, dilemmas, or scenarios.

Examples of suitable themes include:

- ethical dilemmas
- conflicts between students
- fairness
- handling disagreement
- difficult decisions
- communication challenges
- professional responsibility
- teamwork
- responding to mistakes
- dealing with pressure

Each station should test a different competency.

Do not make every MMI question about the candidate's CV, academic history, or motivation.

Do not make MMI questions feel like a normal conversational admissions interview.

Do not ask the candidate to simply describe their CV.

Each question must stand independently as a station.

Ask exactly ONE question at a time.

Do not include station numbers, instructions, scoring criteria, or explanations in the generated question.
`.trim();
    }
};


// ============================================
// GENERATE NEXT INTERVIEW QUESTION
// ============================================

export const generateNextInterviewQuestion =
    async (
        userId: string,
        sessionId: string
    ) => {

        // ========================================
        // GROQ CONFIGURATION
        // ========================================

        if (!process.env.GROQ_API_KEY) {
            throw new AppError(
                "GROQ_API_KEY is not configured",
                500,
                "GROQ_CONFIGURATION_ERROR"
            );
        }


        // ========================================
        // GET SESSION
        // ========================================

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
                )
                .limit(1);


        if (!session) {
            throw new AppError(
                "Session not found",
                404,
                "SESSION_NOT_FOUND"
            );
        }


        // ========================================
        // CHECK MODULE
        // ========================================

        if (
            session.module !==
            "interview"
        ) {
            throw new AppError(
                "This session is not an interview session",
                400,
                "INVALID_SESSION_MODULE"
            );
        }


        // ========================================
        // CHECK SESSION STATUS
        // ========================================

        if (
            session.status !==
            "in_progress"
        ) {
            throw new AppError(
                "Interview session is no longer in progress",
                400,
                "SESSION_NOT_IN_PROGRESS"
            );
        }


        // ========================================
        // GET INTERVIEW FORMAT
        // ========================================

        /*
        |--------------------------------------------------------------------------
        | The session format is the source of truth.
        |--------------------------------------------------------------------------
        |
        | The frontend will eventually send:
        |
        | Panel
        | 1-on-1
        | MMI
        |
        | The format is saved inside sessions.interviewFormat.
        |
        */

        const interviewFormat =
            session.interviewFormat;


        if (
            !interviewFormat ||
            !allowedInterviewFormats.includes(
                interviewFormat as InterviewFormat
            )
        ) {
            throw new AppError(
                "A valid interview format is required",
                400,
                "INVALID_INTERVIEW_FORMAT"
            );
        }


        const format =
            interviewFormat as InterviewFormat;


        const interviewFormatInstructions =
            getInterviewFormatInstructions(
                format
            );


        // ========================================
        // GET PREVIOUS QUESTIONS
        // ========================================

        const previousQuestions =
            await db
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


        // ========================================
        // QUESTION LIMIT
        // ========================================

        if (
            previousQuestions.length >=
            MAX_QUESTIONS
        ) {
            throw new AppError(
                "Maximum interview questions reached",
                400,
                "QUESTION_LIMIT_REACHED"
            );
        }


        // ========================================
        // GET STUDENT PROFILE
        // ========================================

        const [profile] =
            await db
                .select()
                .from(profiles)
                .where(
                    eq(
                        profiles.userId,
                        userId
                    )
                )
                .limit(1);


        // ========================================
        // GET UNIVERSITY
        // ========================================

        let university = null;


        if (session.universityId) {

            const [result] =
                await db
                    .select()
                    .from(universities)
                    .where(
                        eq(
                            universities.id,
                            session.universityId
                        )
                    )
                    .limit(1);


            university =
                result ?? null;
        }


        // ========================================
        // GET COURSE
        // ========================================

        let course = null;


        if (session.courseId) {

            const [result] =
                await db
                    .select()
                    .from(courses)
                    .where(
                        eq(
                            courses.id,
                            session.courseId
                        )
                    )
                    .limit(1);


            course =
                result ?? null;
        }


        // ========================================
        // GET QUESTION SET
        // ========================================

        let questionSet = null;


        if (session.questionSetId) {

            const [result] =
                await db
                    .select()
                    .from(questionSets)
                    .where(
                        eq(
                            questionSets.id,
                            session.questionSetId
                        )
                    )
                    .limit(1);


            questionSet =
                result ?? null;
        }


        // ========================================
        // GET QUESTION BANK
        // ========================================

        let questionBank:
            Array<
                typeof questions.$inferSelect
            > = [];


        if (questionSet) {

            questionBank =
                await db
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
                        asc(
                            questions.orderIndex
                        )
                    );
        }


        // ========================================
        // EXTRACT CV
        // ========================================

        let cvText = "";


        if (profile?.cvFileUrl) {

            try {

                cvText =
                    await extractDocumentText(
                        profile.cvFileUrl
                    );

            } catch (error) {

                console.error(
                    "Failed to extract CV text:",
                    error
                );

                cvText = "";
            }
        }


        // ========================================
        // QUESTION BANK TEXT
        // ========================================

        const questionBankText =
            questionBank.length > 0
                ? questionBank
                    .map(
                        (
                            question,
                            index
                        ) =>
                            `${index + 1}. ${question.text}`
                    )
                    .join("\n")
                : "No administrator questions available.";


        // ========================================
        // PREVIOUS QUESTIONS TEXT
        // ========================================

        const previousQuestionsText =
            previousQuestions.length > 0
                ? previousQuestions
                    .map(
                        (
                            question,
                            index
                        ) =>
                            `${index + 1}. ${question.text}`
                    )
                    .join("\n")
                : "None";


        // ========================================
        // STUDENT PROFILE TEXT
        // ========================================

        const studentProfileText = `
Academic Background:
${profile?.academicBackgroundText ?? "Not provided"}

Personal Statement:
${profile?.personalStatementText ?? "Not provided"}

Bio:
${profile?.bio ?? "Not provided"}

Concerns:
${profile?.concernsText ?? "Not provided"}
        `.trim();


        // ========================================
        // STUDENT CV TEXT
        // ========================================

        const studentCvText =
            cvText.trim().length > 0
                ? cvText.trim()
                : "No CV available.";


        // ========================================
        // CURRENT QUESTION NUMBER
        // ========================================

        const currentQuestionNumber =
            previousQuestions.length + 1;


        // ========================================
        // GROQ GENERATION
        // ========================================

        let completion;


        try {

            completion =
                await groq.chat.completions.create({

                    model,

                    temperature: 0.5,

                    response_format: {
                        type: "json_object",
                    },


                    messages: [

                        // ====================================
                        // SYSTEM PROMPT
                        // ====================================

                        {
                            role: "system",

                            content: `
You are an experienced international university admissions interviewer.

You are conducting a realistic mock admission interview for a student who plans to study at an international university.

${interviewFormatInstructions}

Your goal is to assess whether the student is prepared, motivated, credible, and academically suitable for studying abroad.

Generate exactly ONE interview question.


QUESTION STYLE:

Questions must sound like a real university admissions interviewer speaking naturally to a student.

Keep questions short and conversational.

Prefer 8 to 20 words.

Never exceed 30 words.

Ask exactly ONE question at a time.

Never combine multiple questions.

Do not give explanations before the question.

Do not summarize the student's CV.

Do not use phrases such as:

"Your CV mentions that..."

"According to your CV..."

"Your personal statement states that..."

Instead, naturally refer to the relevant experience.

Example:

Bad:
"Your CV mentions that you developed a full-stack food ordering application using the MERN stack with authentication and order tracking. Can you walk us through how you designed the authentication flow?"

Good:
"What did you learn from developing your food ordering application?"

Good:
"What was the biggest challenge you faced while building that application?"


PERSONALIZATION:

Use the student's actual profile, CV, personal statement, academic background, projects, experience, skills, achievements, and career goals when relevant.

Personalized questions are preferred over generic questions.

Only use information explicitly provided by the student.

Never invent:

- work experience
- internships
- projects
- technologies
- achievements
- awards
- family circumstances
- financial circumstances
- employment
- academic results
- responsibilities


INTERNATIONAL UNIVERSITY ADMISSION FOCUS:

For formats where admissions assessment is appropriate, evaluate areas commonly explored during international university admissions interviews.

These include:

- motivation for studying abroad
- reason for choosing the country
- reason for choosing the university
- reason for choosing the course
- understanding of the chosen course
- academic background
- relevant subjects and knowledge
- previous education
- projects and practical experience
- skills and achievements
- personal statement
- career goals
- plans after graduation
- connection between the course and career goals
- reasons for changing academic direction
- gaps in education
- work or study experience
- strengths and weaknesses
- problem solving
- decision making
- adaptability
- communication
- readiness to study abroad
- understanding of international study
- credibility and consistency

For MMI, prioritize the MMI competencies and scenarios described in the interview format instructions.


INTERVIEW FLOW:

There are exactly 5 questions.

For ONE-ON-ONE:

Question 1 should generally establish motivation and academic direction.

Question 2 should explore the student's academic background or understanding of the chosen course.

Question 3 should explore relevant experience, projects, skills, or achievements.

Question 4 should explore decision making, adaptability, problem solving, or study-abroad readiness.

Question 5 should explore future career plans and how the chosen international education supports those plans.

Use previous questions to decide what should be explored next.


For PANEL:

Across the 5 questions, provide broad assessment coverage.

Questions should collectively explore areas such as:

- academic suitability
- motivation
- course understanding
- experience
- problem solving
- adaptability
- communication
- career goals

Avoid repeatedly exploring the same area.

Different questions may naturally represent different panel perspectives.


For MMI:

Each of the 5 questions represents an independent station.

Each station should assess a different competency.

Prefer scenarios involving:

- ethical reasoning
- situational judgement
- communication
- empathy
- professionalism
- critical thinking
- decision making
- problem solving

Do not make every MMI station a traditional admissions question.

Do not depend on the previous question as if this were a conversational interview.

Each MMI question must stand independently.


QUESTION BANK:

The administrator question bank provides useful themes and examples.

Use it when relevant.

You may adapt a question from the question bank to make it more relevant to the student.

Do not simply copy a question that has already been asked.

For MMI, use the question bank only when it is compatible with an MMI station.


NO REPETITION:

Never repeat a previously asked question.

Do not ask a question with substantially the same meaning as a previous question.

Each question should explore a different aspect of the student's suitability, motivation, or the competency being assessed.

For MMI, each question must assess a different competency or scenario where possible.


QUESTION TYPES:

Return exactly one of:

- motivational
- subject_knowledge
- situational
- ethical
- personal_statement_probe
- gap_career_change


QUESTION TYPE GUIDANCE:

For ONE-ON-ONE and PANEL:

Use the type that best matches the generated question.

For MMI:

Prefer:

- situational
- ethical

Use other types only when they genuinely match the station.


QUESTION LENGTH:

Keep questions concise.

Preferred length: 8-20 words.

Maximum length: 30 words.

If a student's CV contains a long project description, extract only the important fact needed to create a short question.

For example:

CV:
"Developed a full-stack food ordering application using the MERN stack with authentication, menu management, payment integration, and order tracking."

Do NOT generate:
"Your CV mentions that you developed a full-stack food ordering application using the MERN stack with authentication, menu management, payment integration, and order tracking. Can you explain how you implemented the authentication system?"

Generate:
"What did you learn from developing your food ordering application?"

Or:
"What was the biggest challenge you faced while developing your food ordering application?"


OUTPUT:

Return valid JSON only.

Use exactly this structure:

{
    "question": "short natural interview question",
    "type": "motivational | subject_knowledge | situational | ethical | personal_statement_probe | gap_career_change"
}

Do not include explanations.

Do not include markdown.

Do not include multiple questions.
                            `.trim(),
                        },


                        // ====================================
                        // USER PROMPT
                        // ====================================

                        {
                            role: "user",

                            content: `
STUDENT PROFILE

${studentProfileText}


STUDENT CV

${studentCvText}


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

Course Interview Format:
${course?.interviewFormat ?? "Not provided"}

Duration:
${course?.durationMins ?? "Not provided"}

Panel Size:
${course?.panelSize ?? "Not provided"}


SELECTED SESSION INTERVIEW FORMAT

${format}


INTERVIEW FORMAT INSTRUCTIONS

${interviewFormatInstructions}


ADMINISTRATOR QUESTION BANK

${questionBankText}


PREVIOUS QUESTIONS

${previousQuestionsText}


CURRENT QUESTION

This is question ${currentQuestionNumber} of ${MAX_QUESTIONS}.


INSTRUCTIONS

Generate the next international university admission interview question according to the SELECTED SESSION INTERVIEW FORMAT.

The selected format is:

${format}

The generated question must:

- follow the selected interview format
- be natural and conversational
- be relevant to the purpose of the selected format
- preferably use relevant student information when appropriate
- explore a new topic or competency compared with previous questions
- contain only one question
- preferably contain 8-20 words
- never exceed 30 words

For MMI specifically:

- treat this question as an independent station
- prefer realistic scenarios or dilemmas
- assess a distinct competency
- do not depend on previous questions
- do not turn the question into a traditional admissions question

For Panel specifically:

- maintain a formal interview style
- contribute a different assessment perspective where possible
- avoid repeatedly testing the same area

For 1-on-1 specifically:

- maintain a natural conversational flow
- use previous discussion when a follow-up is appropriate
- avoid abrupt or repetitive questioning

Do not say "Your CV mentions".

Do not summarize the student's CV.

Do not ask multiple questions.

Do not repeat previous questions.

Do not invent information.

Return JSON only.
                            `.trim(),
                        },
                    ],
                });

        } catch (error) {

            console.error(
                "Groq question generation failed:",
                error
            );

            throw new AppError(
                "Failed to generate interview question",
                502,
                "GROQ_GENERATION_ERROR"
            );
        }


        // ========================================
        // GET AI CONTENT
        // ========================================

        const content =
            completion
                .choices[0]
                ?.message
                ?.content;


        if (!content) {
            throw new AppError(
                "Groq returned an empty question",
                502,
                "EMPTY_GROQ_RESPONSE"
            );
        }


        // ========================================
        // PARSE JSON
        // ========================================

        let result: {
            question?: string;
            type?: string;
        };


        try {

            result =
                JSON.parse(content);

        } catch (error) {

            console.error(
                "Invalid Groq JSON:",
                content
            );

            throw new AppError(
                "Groq returned invalid JSON",
                502,
                "INVALID_GROQ_JSON"
            );
        }


        // ========================================
        // VALIDATE QUESTION
        // ========================================

        if (
            typeof result.question !==
                "string" ||
            !result.question.trim()
        ) {
            throw new AppError(
                "Groq did not return a valid question",
                502,
                "INVALID_GROQ_QUESTION"
            );
        }


        // ========================================
        // CLEAN QUESTION
        // ========================================

        const generatedQuestion =
            result.question
                .trim()
                .replace(/\s+/g, " ");


        if (
            generatedQuestion.length >
            250
        ) {
            throw new AppError(
                "Generated question is too long",
                502,
                "QUESTION_TOO_LONG"
            );
        }


        // ========================================
        // VALIDATE QUESTION TYPE
        // ========================================

        const questionType:
            QuestionType =
            allowedTypes.includes(
                result.type as QuestionType
            )
                ? result.type as QuestionType
                : "motivational";


        // ========================================
        // NORMALIZE QUESTION
        // ========================================

        const normalizeQuestion =
            (text: string) =>
                text
                    .toLowerCase()
                    .replace(
                        /[^\w\s]/g,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


        const normalizedGenerated =
            normalizeQuestion(
                generatedQuestion
            );


        // ========================================
        // CHECK DUPLICATE
        // ========================================

        const duplicateQuestion =
            previousQuestions.some(
                (previous) =>
                    normalizeQuestion(
                        previous.text
                    ) ===
                    normalizedGenerated
            );


        if (duplicateQuestion) {
            throw new AppError(
                "Generated question was already asked",
                502,
                "DUPLICATE_INTERVIEW_QUESTION"
            );
        }


        // ========================================
        // SAVE QUESTION
        // ========================================

        const orderIndex =
            previousQuestions.length + 1;


        const [savedQuestion] =
            await db
                .insert(sessionQuestions)
                .values({
                    sessionId,

                    text:
                        generatedQuestion,

                    type:
                        questionType,

                    orderIndex,
                })
                .returning();


        // ========================================
        // RESPONSE
        // ========================================

        return {

            questionId:
                savedQuestion.id,

            question:
                savedQuestion.text,

            type:
                savedQuestion.type,

            orderIndex:
                savedQuestion.orderIndex,

            totalQuestions:
                MAX_QUESTIONS,

            isLastQuestion:
                savedQuestion.orderIndex ===
                MAX_QUESTIONS,
        };
    };