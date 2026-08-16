import { eq } from "drizzle-orm";

import { db } from "../db";
import { sessions } from "../db/schema";

import { CreateSessionInput } from "../validations/sessionValidation";

export const createSession = async (
    userId: string,
    data: CreateSessionInput
) => {
    const [session] = await db
        .insert(sessions)
        .values({
            userId,
            module: data.module,
            universityId: data.universityId ?? null,
            courseId: data.courseId ?? null,
            questionSetId: data.questionSetId ?? null,
        })
        .returning();

    return session;
};

export const getUserSessions = async (userId: string) => {
    const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId));

    return userSessions;
};