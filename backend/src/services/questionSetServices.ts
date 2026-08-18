import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { courses, questionSets, questions } from "../db/schema";

export const createQuestionSet = async (
    courseId: string,
    name: string,
    description?: string
) => {
    const course = await db
        .select({ id: courses.id })
        .from(courses)
        .where(
            and(
                eq(courses.id, courseId),
                eq(courses.isActive, true)
            )
        )
        .limit(1);

    if (!course.length) {
        throw new Error("Active course not found");
    }

    const [questionSet] = await db
        .insert(questionSets)
        .values({
            courseId,
            name,
            description,
            isActive: true,
        })
        .returning();

    return questionSet;
};

export const getQuestionSet = async (id: string) => {
    const result = await db
        .select()
        .from(questionSets)
        .where(eq(questionSets.id, id))
        .limit(1);

    if (!result.length) {
        throw new Error("Question set not found");
    }

    return result[0];
};

export const updateQuestionSet = async (
    id: string,
    data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }
) => {
    const [questionSet] = await db
        .update(questionSets)
        .set(data)
        .where(eq(questionSets.id, id))
        .returning();

    if (!questionSet) {
        throw new Error("Question set not found");
    }

    return questionSet;
};

export const deactivateQuestionSet = async (id: string) => {
    const [questionSet] = await db
        .update(questionSets)
        .set({
            isActive: false,
        })
        .where(eq(questionSets.id, id))
        .returning();

    if (!questionSet) {
        throw new Error("Question set not found");
    }

    return questionSet;
};

export const deleteQuestionSet = async (id: string) => {
    const [questionSet] = await db
        .delete(questionSets)
        .where(eq(questionSets.id, id))
        .returning();

    if (!questionSet) {
        throw new Error("Question set not found");
    }

    return questionSet;
};

export const getQuestionsForSet = async (setId: string) => {
    return await db
        .select()
        .from(questions)
        .where(
            and(
                eq(questions.questionSetId, setId),
                eq(questions.isActive, true)
            )
        )
        .orderBy(asc(questions.orderIndex));
};

export const reorderQuestions = async (
    setId: string,
    questionIds: string[]
) => {
    const existingQuestions = await db
        .select({
            id: questions.id,
        })
        .from(questions)
        .where(
            and(
                eq(questions.questionSetId, setId),
                eq(questions.isActive, true)
            )
        );

    if (existingQuestions.length !== questionIds.length) {
        throw new Error(
            "Question IDs must include all active questions in the set"
        );
    }

    const existingIds = existingQuestions.map(
        (question) => question.id
    );

    const allIdsBelongToSet =
        questionIds.every((id) =>
            existingIds.includes(id)
        );

    if (!allIdsBelongToSet) {
        throw new Error(
            "One or more question IDs do not belong to this question set"
        );
    }

    const uniqueIds = new Set(questionIds);

    if (uniqueIds.size !== questionIds.length) {
        throw new Error(
            "Question IDs must be unique"
        );
    }

    return await db.transaction(async (tx) => {
        for (
            let index = 0;
            index < questionIds.length;
            index++
        ) {
            await tx
                .update(questions)
                .set({
                    orderIndex: index,
                })
                .where(
                    and(
                        eq(questions.id, questionIds[index]),
                        eq(
                            questions.questionSetId,
                            setId
                        )
                    )
                );
        }

        return await tx
            .select()
            .from(questions)
            .where(
                and(
                    eq(
                        questions.questionSetId,
                        setId
                    ),
                    eq(questions.isActive, true)
                )
            )
            .orderBy(asc(questions.orderIndex));
    });
};
export const getAllQuestions = async () => {
    return await db
        .select()
        .from(questions)
        .where(eq(questions.isActive, true))
        .orderBy(asc(questions.orderIndex));
};