import Groq from "groq-sdk";
import dotenv from "dotenv";
import { and, desc, eq } from "drizzle-orm";

import { db } from "../db";
import { prompts } from "../db/schema";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model =
    process.env.GROQ_FEEDBACK_MODEL ||
    "openai/gpt-oss-20b";

// ============================================================
// INTERVIEW TYPES
// ============================================================

export type FeedbackInput = {
    questionId: string;
    transcript: string;
};

export type InterviewFormat =
    | "Panel"
    | "1-on-1"
    | "MMI";

export type InterviewFeedbackInput = {
    interviewFormat: InterviewFormat;
    transcripts: FeedbackInput[];
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

// ============================================================
// SPEAKING TYPES
// ============================================================

export type SpeakingFeedbackInput = {
    questionId: string | null;
    transcript: string;
    durationSeconds: number;
};

export type SpeakingFeedbackInputs =
    SpeakingFeedbackInput[];

export type SpeakingFeedbackResult = {
    overallBand: number;
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
    speakingPace: number;
    fillerWords: number;
    speakingTime: string;
    strengths: string[];
    improvements: string[];
    examinerNote: string;
    answerFeedback?: {
        questionId: string | null;
        questionNumber: number;
        durationSeconds: number;
        speakingPace: number;
        fillerWords: number;
        feedback: string;
    }[];
};

// ============================================================
// PROMPT MODULES
// ============================================================

type PromptModule =
    | "interview_feedback"
    | "ielts_speaking"
    | "ielts_writing"
    | "ielts_listening_summary";

// ============================================================
// GET ACTIVE PROMPT
// ============================================================

const getActivePrompt = async (
    module: PromptModule
): Promise<string> => {
    const result = await db
        .select()
        .from(prompts)
        .where(
            and(
                eq(prompts.module, module),
                eq(prompts.isActive, true)
            )
        )
        .orderBy(desc(prompts.version))
        .limit(1);

    return result[0]?.contentText || "";
};

// ============================================================
// INTERVIEW FORMAT INSTRUCTIONS
// ============================================================

const getInterviewFormatInstructions = (
    format: InterviewFormat
): string => {
    switch (format) {
        case "Panel":
            return `
INTERVIEW FORMAT: PANEL

Evaluate the candidate as if they were interviewed by a formal university admissions panel.

Focus on:
- academic suitability
- motivation
- course understanding
- academic preparation
- communication
- adaptability
- problem solving
- relevant experience
- career goals
- study-abroad readiness
- credibility and consistency

Assess whether the candidate's answers would satisfy different panel perspectives.

Consider:
- academic interviewer perspective
- admissions interviewer perspective
- subject-focused perspective
- career-focused perspective
- behavioral perspective

Evaluate the candidate's overall performance across these dimensions rather than treating the interview as a casual conversation.
`.trim();

        case "1-on-1":
            return `
INTERVIEW FORMAT: ONE-ON-ONE

Evaluate the candidate as if they were interviewed by one university admissions interviewer.

Focus on:
- motivation
- academic direction
- course understanding
- relevant experience
- communication
- depth of answers
- consistency
- adaptability
- problem solving
- study-abroad readiness
- career goals
- connection between education and career plans

Pay particular attention to how naturally and coherently the candidate communicates.

Evaluate whether the candidate provides thoughtful, credible and sufficiently developed answers.
`.trim();

        case "MMI":
            return `
INTERVIEW FORMAT: MMI

Evaluate the candidate as if they completed a Multiple Mini Interview.

Prioritize MMI competencies:
- ethical reasoning
- situational judgement
- communication
- empathy
- professionalism
- critical thinking
- decision making
- problem solving
- adaptability
- fairness
- responsibility

Evaluate how effectively the candidate:
- identifies the central issue
- considers different perspectives
- recognizes ethical considerations
- explains their reasoning
- considers consequences
- demonstrates empathy
- communicates respectfully
- makes balanced decisions
- handles uncertainty
- proposes practical solutions

Do not primarily evaluate the candidate based on university motivation, CV quality, academic history, or career goals unless those elements are directly relevant to an answer.

MMI answers should be judged primarily on reasoning, judgement, communication and interpersonal competencies.
`.trim();
    }
};

// ============================================================
// INTERVIEW FEEDBACK
// ============================================================

export const generateFeedbackWithGroq =
    async ({
        interviewFormat,
        transcripts,
    }: InterviewFeedbackInput): Promise<FeedbackResult> => {
        if (
            !Array.isArray(transcripts) ||
            transcripts.length === 0
        ) {
            throw new Error(
                "No interview transcripts provided"
            );
        }

        if (!process.env.GROQ_API_KEY) {
            throw new Error(
                "GROQ_API_KEY is not configured"
            );
        }

        if (
            !["Panel", "1-on-1", "MMI"].includes(
                interviewFormat
            )
        ) {
            throw new Error(
                "Invalid interview format"
            );
        }

        const systemPrompt =
            await getActivePrompt(
                "interview_feedback"
            );

        const formatInstructions =
            getInterviewFormatInstructions(
                interviewFormat
            );

        const prompt = `
${systemPrompt}

INTERVIEW FORMAT

${interviewFormat}

FORMAT-SPECIFIC EVALUATION INSTRUCTIONS

${formatInstructions}

Evaluate the following completed interview answers according to the selected interview format.

IMPORTANT:

The selected interview format is the source of truth.

Do not evaluate all formats using the same criteria.

For PANEL:
Evaluate broad university admissions suitability and consider the different perspectives a panel may have.

For 1-on-1:
Evaluate the quality, depth, consistency and natural conversational development of the candidate's answers.

For MMI:
Evaluate reasoning, judgement, ethics, empathy, communication, professionalism, problem solving and decision making. Treat each station independently.

Score each answer from 0 to 100.

The overall score must represent the candidate's performance across the selected interview format.

Return ONLY valid JSON matching this structure:

{
  "overall_score": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "summary": "",
  "answer_feedback": [
    {
      "question_id": "",
      "score": 0,
      "feedback": ""
    }
  ]
}

Rules:

- overall_score must be between 0 and 100.
- Each answer score must be between 0 and 100.
- answer_feedback must contain one item for every supplied answer.
- Preserve each supplied question_id exactly.
- Do not invent information about the candidate.
- Base feedback only on the provided answers.
- Give specific and actionable feedback.
- Do not evaluate pronunciation from transcript alone.
- Do not claim acoustic or phonetic analysis was performed.
- Do not claim the score is an official university admissions score.
- Do not include markdown.
- Return JSON only.

Answers:
${JSON.stringify(transcripts)}
`;

        const completion =
            await groq.chat.completions.create({
                model,
                temperature: 0.2,
                response_format: {
                    type: "json_object",
                },
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert university admissions interview evaluator. Return only valid JSON.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });

        const content =
            completion.choices[0]
                ?.message?.content;

        if (
            typeof content !== "string" ||
            content.trim().length === 0
        ) {
            throw new Error(
                "Groq returned empty interview feedback"
            );
        }

        let parsed: FeedbackResult;

        try {
            parsed =
                JSON.parse(
                    content
                ) as FeedbackResult;
        } catch {
            console.error(
                "Failed to parse Groq interview feedback:",
                content
            );

            throw new Error(
                "Groq returned invalid interview feedback JSON"
            );
        }

        parsed.overall_score = Math.min(
            100,
            Math.max(
                0,
                Number(parsed.overall_score) || 0
            )
        );

        if (!Array.isArray(parsed.strengths)) {
            parsed.strengths = [];
        }

        if (!Array.isArray(parsed.weaknesses)) {
            parsed.weaknesses = [];
        }

        if (!Array.isArray(parsed.recommendations)) {
            parsed.recommendations = [];
        }

        if (
            typeof parsed.summary !==
            "string"
        ) {
            parsed.summary = "";
        }

        if (
            !Array.isArray(
                parsed.answer_feedback
            )
        ) {
            parsed.answer_feedback = [];
        }

        parsed.answer_feedback =
            parsed.answer_feedback.map(
                (item) => ({
                    question_id:
                        item.question_id,
                    score: Math.min(
                        100,
                        Math.max(
                            0,
                            Number(item.score) || 0
                        )
                    ),
                    feedback:
                        typeof item.feedback ===
                        "string"
                            ? item.feedback
                            : "",
                })
            );

        return parsed;
    };

// ============================================================
// SPEAKING HELPERS
// ============================================================

const countFillerWords = (
    transcript: string
): number => {
    const fillerPattern =
        /\b(um|uh|er|erm|ah|like|you know|basically|actually|literally|sort of|kind of|i mean)\b/gi;

    return (
        transcript.match(
            fillerPattern
        )?.length || 0
    );
};

const roundHalf = (
    value: number
): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.round(value * 2) / 2;
};

const clampIELTSBand = (
    value: number
): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return roundHalf(
        Math.min(
            9,
            Math.max(0, value)
        )
    );
};

const formatSpeakingTime = (
    seconds: number
): string => {
    const safeSeconds = Math.max(
        0,
        Math.round(seconds)
    );

    const minutes =
        Math.floor(
            safeSeconds / 60
        );

    const remainingSeconds =
        safeSeconds % 60;

    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

// ============================================================
// SPEAKING FEEDBACK
// ============================================================

export const generateSpeakingFeedbackWithGroq =
    async (
        inputs: SpeakingFeedbackInputs
    ): Promise<SpeakingFeedbackResult> => {
        if (!process.env.GROQ_API_KEY) {
            throw new Error(
                "GROQ_API_KEY is not configured"
            );
        }

        if (
            !Array.isArray(inputs) ||
            inputs.length === 0
        ) {
            throw new Error(
                "No speaking answers provided"
            );
        }

        // --------------------------------------------------------
        // Validate and calculate per-answer metrics
        // --------------------------------------------------------

        const processedAnswers =
            inputs.map(
                (input, index) => {
                    if (
                        !input.transcript ||
                        input.transcript
                            .trim()
                            .length === 0
                    ) {
                        throw new Error(
                            `Speaking transcript is empty for answer ${
                                index + 1
                            }`
                        );
                    }

                    if (
                        !Number.isFinite(
                            input.durationSeconds
                        ) ||
                        input.durationSeconds <= 0
                    ) {
                        throw new Error(
                            `Speaking duration is invalid for answer ${
                                index + 1
                            }`
                        );
                    }

                    const wordCount =
                        input.transcript
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean)
                            .length;

                    const durationMinutes =
                        input.durationSeconds /
                        60;

                    const speakingPace =
                        durationMinutes > 0
                            ? Math.round(
                                  wordCount /
                                      durationMinutes
                              )
                            : 0;

                    const fillerWords =
                        countFillerWords(
                            input.transcript
                        );

                    const speakingTime =
                        formatSpeakingTime(
                            input.durationSeconds
                        );

                    return {
                        questionId:
                            input.questionId,
                        transcript:
                            input.transcript.trim(),
                        durationSeconds:
                            input.durationSeconds,
                        wordCount,
                        speakingPace,
                        fillerWords,
                        speakingTime,
                    };
                }
            );

        // --------------------------------------------------------
        // Overall calculated speaking metrics
        // --------------------------------------------------------

        const totalDurationSeconds =
            processedAnswers.reduce(
                (total, answer) =>
                    total +
                    answer.durationSeconds,
                0
            );

        const totalWordCount =
            processedAnswers.reduce(
                (total, answer) =>
                    total +
                    answer.wordCount,
                0
            );

        const totalFillerWords =
            processedAnswers.reduce(
                (total, answer) =>
                    total +
                    answer.fillerWords,
                0
            );

        const totalDurationMinutes =
            totalDurationSeconds / 60;

        const overallSpeakingPace =
            totalDurationMinutes > 0
                ? Math.round(
                      totalWordCount /
                          totalDurationMinutes
                  )
                : 0;

        const overallSpeakingTime =
            formatSpeakingTime(
                totalDurationSeconds
            );

        // --------------------------------------------------------
        // Get active IELTS speaking prompt
        // --------------------------------------------------------

        const systemPrompt =
            await getActivePrompt(
                "ielts_speaking"
            );

        // --------------------------------------------------------
        // Build all-answer evaluation text
        // --------------------------------------------------------

        const answerText =
            processedAnswers
                .map(
                    (
                        answer,
                        index
                    ) => `
ANSWER ${index + 1}

Question ID:
${answer.questionId ?? "unknown"}

Duration:
${answer.durationSeconds} seconds

Speaking time:
${answer.speakingTime}

Word count:
${answer.wordCount}

Speaking pace:
${answer.speakingPace} words per minute

Detected filler words:
${answer.fillerWords}

Transcript:
${answer.transcript}
`
                )
                .join("\n------------------------\n");

        // --------------------------------------------------------
        // Groq prompt
        // --------------------------------------------------------

        const prompt = `
${systemPrompt}

You are an expert IELTS Speaking examiner.

Evaluate the candidate's COMPLETE speaking performance based on ALL supplied answers.

The candidate has provided multiple speaking responses.

Do NOT evaluate only the first answer.

Evaluate the performance across ALL answers and produce one overall IELTS Speaking assessment.

Evaluate all four official IELTS Speaking criteria:

1. Fluency and Coherence
2. Lexical Resource
3. Grammatical Range and Accuracy
4. Pronunciation

IMPORTANT PRONUNCIATION LIMITATION:

There is no external acoustic pronunciation-analysis system available.

Therefore, do NOT claim that Azure, acoustic analysis, phoneme analysis, audio waveform analysis, or dedicated pronunciation measurement was performed.

Pronunciation must be treated as an AI estimate based only on transcript-level evidence.

Do not invent specific pronunciation errors that cannot be established from the transcript.

Evaluate Fluency and Coherence based on:

- hesitation
- repetition
- self-correction
- ability to maintain natural flow
- organization of ideas
- linking and discourse markers
- development of ideas
- consistency across answers

Evaluate Lexical Resource based on:

- vocabulary range
- precision
- appropriacy
- repetition
- paraphrasing
- collocations
- natural word combinations
- vocabulary variety across answers

Evaluate Grammatical Range and Accuracy based on:

- sentence variety
- complex structures
- grammatical accuracy
- grammatical errors
- clarity
- consistency across answers

Evaluate Pronunciation cautiously because only transcript-level evidence is available.

The overall evaluation should represent the candidate's performance across ALL supplied answers.

Do not simply average unrelated answers without considering the candidate's overall speaking performance.

------------------------------------------------------------

OVERALL SPEAKING INFORMATION

Number of answers:
${processedAnswers.length}

Total speaking time:
${overallSpeakingTime}

Total word count:
${totalWordCount}

Overall speaking pace:
${overallSpeakingPace} words per minute

Total detected filler words:
${totalFillerWords}

------------------------------------------------------------

ANSWERS

${answerText}

------------------------------------------------------------

Return ONLY valid JSON.

Required structure:

{
  "overallBand": 0,
  "fluencyCoherence": 0,
  "lexicalResource": 0,
  "grammaticalRange": 0,
  "pronunciation": 0,
  "speakingPace": 0,
  "fillerWords": 0,
  "speakingTime": "",
  "strengths": [],
  "improvements": [],
  "examinerNote": "",
  "answerFeedback": [
    {
      "questionId": "",
      "questionNumber": 1,
      "durationSeconds": 0,
      "speakingPace": 0,
      "fillerWords": 0,
      "feedback": ""
    }
  ]
}

Rules:

- overallBand must be the average of the four IELTS criteria rounded to the nearest 0.5.
- fluencyCoherence must be between 0 and 9.
- lexicalResource must be between 0 and 9.
- grammaticalRange must be between 0 and 9.
- pronunciation must be between 0 and 9.
- IELTS criterion scores may use half bands.
- speakingPace MUST equal ${overallSpeakingPace}.
- fillerWords MUST equal ${totalFillerWords}.
- speakingTime MUST equal "${overallSpeakingTime}".
- answerFeedback MUST contain exactly ${processedAnswers.length} items.
- Preserve every supplied questionId exactly.
- questionNumber must correspond to the answer order.
- durationSeconds must match the supplied duration.
- speakingPace for each answer must match the supplied calculated pace.
- fillerWords for each answer must match the supplied calculated filler count.
- Do not invent pronunciation measurements.
- Do not claim audio was acoustically analyzed.
- Do not claim this is an official IELTS score.
- strengths must contain specific observations from the candidate's answers.
- improvements must contain actionable suggestions.
- examinerNote must be concise and realistic.
- answerFeedback should contain specific feedback for each individual answer.
- Base all feedback only on the supplied transcripts.
- Do not include markdown.
- Return JSON only.
`;

        // --------------------------------------------------------
        // Groq request
        // --------------------------------------------------------

        const completion =
            await groq.chat.completions.create({
                model,
                temperature: 0.1,
                response_format: {
                    type: "json_object",
                },
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a strict IELTS Speaking examiner evaluating the candidate's complete speaking performance. Return only valid JSON.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });

        const content =
            completion.choices[0]
                ?.message?.content;

        if (
            typeof content !== "string" ||
            content.trim().length === 0
        ) {
            throw new Error(
                "Groq returned empty speaking feedback"
            );
        }

        // --------------------------------------------------------
        // Parse JSON
        // --------------------------------------------------------

        let parsed: SpeakingFeedbackResult;

        try {
            parsed =
                JSON.parse(
                    content
                ) as SpeakingFeedbackResult;
        } catch {
            console.error(
                "Failed to parse Groq speaking feedback:",
                content
            );

            throw new Error(
                "Groq returned invalid speaking feedback JSON"
            );
        }

        // --------------------------------------------------------
        // Normalize IELTS scores
        // --------------------------------------------------------

        parsed.fluencyCoherence =
            clampIELTSBand(
                Number(
                    parsed.fluencyCoherence
                )
            );

        parsed.lexicalResource =
            clampIELTSBand(
                Number(
                    parsed.lexicalResource
                )
            );

        parsed.grammaticalRange =
            clampIELTSBand(
                Number(
                    parsed.grammaticalRange
                )
            );

        parsed.pronunciation =
            clampIELTSBand(
                Number(
                    parsed.pronunciation
                )
            );

        // Always calculate overall band ourselves.
        const rawOverall =
            (
                parsed.fluencyCoherence +
                parsed.lexicalResource +
                parsed.grammaticalRange +
                parsed.pronunciation
            ) / 4;

        parsed.overallBand =
            roundHalf(rawOverall);

        // --------------------------------------------------------
        // Never trust Groq for calculated metrics
        // --------------------------------------------------------

        parsed.speakingPace =
            overallSpeakingPace;

        parsed.fillerWords =
            totalFillerWords;

        parsed.speakingTime =
            overallSpeakingTime;

        // --------------------------------------------------------
        // Normalize arrays
        // --------------------------------------------------------

        if (
            !Array.isArray(
                parsed.strengths
            )
        ) {
            parsed.strengths = [];
        }

        if (
            !Array.isArray(
                parsed.improvements
            )
        ) {
            parsed.improvements = [];
        }

        if (
            typeof parsed.examinerNote !==
            "string"
        ) {
            parsed.examinerNote = "";
        }

        // --------------------------------------------------------
        // Normalize per-answer feedback
        // --------------------------------------------------------

        if (
            !Array.isArray(
                parsed.answerFeedback
            )
        ) {
            parsed.answerFeedback = [];
        }

        parsed.answerFeedback =
            processedAnswers.map(
                (
                    answer,
                    index
                ) => {
                    const aiFeedback =
                        parsed.answerFeedback?.[
                            index
                        ];

                    return {
                        questionId:
                            answer.questionId,
                        questionNumber:
                            index + 1,
                        durationSeconds:
                            answer.durationSeconds,
                        speakingPace:
                            answer.speakingPace,
                        fillerWords:
                            answer.fillerWords,
                        feedback:
                            typeof aiFeedback
                                ?.feedback ===
                            "string"
                                ? aiFeedback.feedback
                                : "",
                    };
                }
            );

        return parsed;
    };