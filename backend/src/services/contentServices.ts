import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { courses, universities, questionSets, questions } from "../db/schema";

export const fetchUniversities = async () => {
    return await db
        .select({
            id: universities.id,
            name: universities.name,
            country: universities.country,
            description: universities.description,
            logoUrl: universities.logoUrl,
            interviewOverview: universities.interviewOverview,
            createdAt: universities.createdAt,
        })
        .from(universities)
        .where(eq(universities.isActive, true));
};

export const fetchCoursesByUniversity = async (
    universityId: string
) => {
    return await db
        .select({
            id: courses.id,
            universityId: courses.universityId,
            name: courses.name,
            track: courses.track,
            interviewFormat: courses.interviewFormat,
            durationMins: courses.durationMins,
            panelSize: courses.panelSize,
            studentContext: courses.studentContext,
            createdAt: courses.createdAt,
        })
        .from(courses)
        .where(
            and(
                eq(courses.universityId, universityId),
                eq(courses.isActive, true)
            )
        );
};
export const getQuestionSetsByCourseId = async (courseId: string) => {
    return await db
        .select()
        .from(questionSets)
        .where(
            and(
                eq(questionSets.courseId, courseId),
                eq(questionSets.isActive, true)
            )
        )
        .orderBy(asc(questionSets.createdAt));
};

export const getQuestionsBySetId = async (setId: string) => {
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