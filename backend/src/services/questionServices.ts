import { and, eq } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import { db } from "../db";
import { courses, questionSets, questions } from "../db/schema";

type QuestionData = {
    questionSetId: string;
    text: string;
    typeTag?:
        | "motivational"
        | "subject_knowledge"
        | "situational"
        | "ethical"
        | "personal_statement_probe"
        | "gap_career_change";
    difficulty?: "1" | "2" | "3" | "4" | "5";
    frequency?: "almost_always" | "common" | "occasional";
    orderIndex?: number;
};

type CsvQuestionRow = {
    questionSetId?: string;
    text?: string;
    typeTag?: string;
    difficulty?: string;
    frequency?: string;
    orderIndex?: string;
};

const validateQuestionSet = async (questionSetId: string) => {
    const result = await db
        .select({
            id: questionSets.id,
        })
        .from(questionSets)
        .innerJoin(
            courses,
            eq(questionSets.courseId, courses.id)
        )
        .where(
            and(
                eq(questionSets.id, questionSetId),
                eq(questionSets.isActive, true),
                eq(courses.isActive, true)
            )
        )
        .limit(1);

    if (!result.length) {
        throw new Error("Active question set not found");
    }
};

export const createQuestion = async (data: QuestionData) => {
    await validateQuestionSet(data.questionSetId);

    const [question] = await db
        .insert(questions)
        .values({
            questionSetId: data.questionSetId,
            text: data.text,
            typeTag: data.typeTag,
            difficulty: data.difficulty ?? "3",
            frequency: data.frequency ?? "common",
            orderIndex: data.orderIndex ?? 0,
            isActive: true,
            version: 1,
        })
        .returning();

    return question;
};

export const getAllQuestions = async () => {
    return await db
        .select()
        .from(questions)
        .where(eq(questions.isActive, true))
        .orderBy(questions.orderIndex);
};

export const getQuestion = async (questionId: string) => {
    const result = await db
        .select()
        .from(questions)
        .where(eq(questions.id, questionId))
        .limit(1);

    if (!result.length) {
        throw new Error("Question not found");
    }

    return result[0];
};

export const updateQuestion = async (
    questionId: string,
    data: Partial<Omit<QuestionData, "questionSetId">>
) => {
    const [question] = await db
        .update(questions)
        .set(data)
        .where(eq(questions.id, questionId))
        .returning();

    if (!question) {
        throw new Error("Question not found");
    }

    return question;
};

export const deleteQuestion = async (questionId: string) => {
    const [question] = await db
        .update(questions)
        .set({
            isActive: false,
        })
        .where(eq(questions.id, questionId))
        .returning();

    if (!question) {
        throw new Error("Question not found");
    }

    return question;
};

export const bulkImportQuestions = async (csvBuffer: Buffer) => {
    if (!csvBuffer || csvBuffer.length === 0) {
        throw new Error("CSV file is empty");
    }

    const csvText = csvBuffer
        .toString("utf8")
        .replace(/^\uFEFF/, "")
        .trim();

    console.log("========== CSV RECEIVED ==========");
    console.log(csvText);
    console.log("==================================");

    const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
    }) as Record<string, string>[];

    console.log("========== PARSED RECORDS ==========");
    console.dir(records, { depth: null });
    console.log("====================================");

    if (!records.length) {
        throw new Error("CSV file is empty");
    }

    const questionsToInsert: QuestionData[] = [];

    for (let index = 0; index < records.length; index++) {
        const row = records[index];

        console.log(`CSV ROW ${index + 2}:`, row);

        const questionSetId =
            row["questionSetId"]?.trim();

        const text =
            row["text"]?.trim();

        const typeTag =
            row["typeTag"]?.trim();

        const difficulty =
            row["difficulty"]?.trim();

        const frequency =
            row["frequency"]?.trim();

        const orderIndexRaw =
            row["orderIndex"]?.trim();

        if (!questionSetId || !text) {
            throw new Error(
                `Invalid CSV row ${index + 2}: questionSetId and text are required`
            );
        }

        if (
            typeTag &&
            ![
                "motivational",
                "subject_knowledge",
                "situational",
                "ethical",
                "personal_statement_probe",
                "gap_career_change",
            ].includes(typeTag)
        ) {
            throw new Error(
                `Invalid typeTag at CSV row ${index + 2}`
            );
        }

        if (
            difficulty &&
            !["1", "2", "3", "4", "5"].includes(
                difficulty
            )
        ) {
            throw new Error(
                `Invalid difficulty at CSV row ${index + 2}`
            );
        }

        if (
            frequency &&
            ![
                "almost_always",
                "common",
                "occasional",
            ].includes(frequency)
        ) {
            throw new Error(
                `Invalid frequency at CSV row ${index + 2}`
            );
        }

        const orderIndex =
            orderIndexRaw !== undefined &&
            orderIndexRaw !== ""
                ? Number(orderIndexRaw)
                : index;

        if (Number.isNaN(orderIndex)) {
            throw new Error(
                `Invalid orderIndex at CSV row ${index + 2}`
            );
        }

        await validateQuestionSet(questionSetId);

        questionsToInsert.push({
            questionSetId,
            text,
            typeTag:
                typeTag as QuestionData["typeTag"],
            difficulty:
                (difficulty ||
                    "3") as QuestionData["difficulty"],
            frequency:
                (frequency ||
                    "common") as QuestionData["frequency"],
            orderIndex,
        });
    }

    return await db.transaction(async (tx) => {
        return await tx
            .insert(questions)
            .values(
                questionsToInsert.map((question) => ({
                    questionSetId: question.questionSetId,
                    text: question.text,
                    typeTag: question.typeTag,
                    difficulty: question.difficulty,
                    frequency: question.frequency,
                    orderIndex: question.orderIndex,
                    isActive: true,
                    version: 1,
                }))
            )
            .returning();
    });
};