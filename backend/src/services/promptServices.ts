import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { prompts } from "../db/schema";

export type PromptModule =
    | "interview_feedback"
    | "ielts_speaking"
    | "ielts_writing"
    | "ielts_listening_summary";

const validateModule = (module: string): PromptModule => {
    const validModules: PromptModule[] = [
        "interview_feedback",
        "ielts_speaking",
        "ielts_writing",
        "ielts_listening_summary",
    ];

    if (!validModules.includes(module as PromptModule)) {
        throw new Error(`Invalid prompt module: ${module}`);
    }

    return module as PromptModule;
};

export const createPrompt = async (data: {
    module: PromptModule;
    contentText: string;
    createdBy?: string;
}) => {
    validateModule(data.module);

    if (!data.contentText?.trim()) {
        throw new Error("Prompt content is required");
    }

    const latest = await db
        .select({
            version: prompts.version,
        })
        .from(prompts)
        .where(eq(prompts.module, data.module))
        .orderBy(desc(prompts.version))
        .limit(1);

    const nextVersion =
        latest.length > 0
            ? latest[0].version + 1
            : 1;

    const [prompt] = await db
        .insert(prompts)
        .values({
            module: data.module,
            version: nextVersion,
            contentText: data.contentText.trim(),
            isActive: false,
            createdBy: data.createdBy,
        })
        .returning();

    return prompt;
};

export const getPromptHistory = async (
    module: PromptModule
) => {
    validateModule(module);

    return await db
        .select()
        .from(prompts)
        .where(eq(prompts.module, module))
        .orderBy(desc(prompts.version));
};

export const getActivePrompt = async (
    module: PromptModule
) => {
    validateModule(module);

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

    return result[0] ?? null;
};

export const activatePrompt = async (
    promptId: string
) => {
    return await db.transaction(async (tx) => {
        const result = await tx
            .select()
            .from(prompts)
            .where(eq(prompts.id, promptId))
            .limit(1);

        if (!result.length) {
            throw new Error("Prompt not found");
        }

        const prompt = result[0];

        await tx
            .update(prompts)
            .set({
                isActive: false,
            })
            .where(eq(prompts.module, prompt.module));

        const [activated] = await tx
            .update(prompts)
            .set({
                isActive: true,
            })
            .where(eq(prompts.id, promptId))
            .returning();

        return activated;
    });
};

export const rollbackPrompt = async (
    promptId: string
) => {
    return await db.transaction(async (tx) => {
        const result = await tx
            .select()
            .from(prompts)
            .where(eq(prompts.id, promptId))
            .limit(1);

        if (!result.length) {
            throw new Error("Prompt not found");
        }

        const prompt = result[0];

        await tx
            .update(prompts)
            .set({
                isActive: false,
            })
            .where(eq(prompts.module, prompt.module));

        const [rolledBack] = await tx
            .update(prompts)
            .set({
                isActive: true,
            })
            .where(eq(prompts.id, promptId))
            .returning();

        return rolledBack;
    });
};