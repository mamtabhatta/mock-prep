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

export type PromptPreviewInput = {
    module:
        | "interview_feedback"
        | "ielts_speaking"
        | "ielts_writing"
        | "ielts_listening_summary";

    transcript: string;
};

export const previewPrompt = async (
    data: PromptPreviewInput
) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    if (!data.transcript?.trim()) {
        throw new Error("Transcript is required");
    }

    const activePrompt = await db
        .select()
        .from(prompts)
        .where(
            and(
                eq(prompts.module, data.module),
                eq(prompts.isActive, true)
            )
        )
        .orderBy(desc(prompts.version))
        .limit(1);

    if (!activePrompt.length) {
        throw new Error(
            `No active prompt found for module: ${data.module}`
        );
    }

    const prompt = activePrompt[0];

    const completion =
        await groq.chat.completions.create({
            model,

            messages: [
                {
                    role: "system",
                    content: `
${prompt.contentText}

Return your response as valid JSON only.

Do not use Markdown.
Do not use tables.
Do not use backticks.
Do not add explanations outside the JSON object.

The JSON should contain:
- summary
- strengths
- weaknesses
- recommendations

Use this structure:
{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"]
}
                    `.trim(),
                },
                {
                    role: "user",
                    content: `
Sample transcript:

${data.transcript.trim()}
                    `.trim(),
                },
            ],

            temperature: 0,

            response_format: {
                type: "json_object",
            },
        });

    const content =
        completion.choices[0]?.message?.content;

    if (!content) {
        throw new Error(
            "Groq returned an empty preview response"
        );
    }

    return {
        promptId: prompt.id,
        version: prompt.version,
        module: prompt.module,
        output: content,
    };
};