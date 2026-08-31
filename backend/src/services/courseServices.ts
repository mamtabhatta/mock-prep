import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { courses, universities } from "../db/schema";

export const createCourse = async (data: {
    universityId: string;
    name: string;
    track?: "admission" | "visa";
    interviewFormat?: "mmi" | "panel" | "portfolio" | "one_on_one" | "none";
    durationMins?: number;
    panelSize?: number;
    studentContext?: string;
    adminNotes?: string;
}) => {
    const university = await db
        .select()
        .from(universities)
        .where(
            and(
                eq(universities.id, data.universityId),
                eq(universities.isActive, true)
            )
        )
        .limit(1);

    if (!university.length) {
        throw new Error("Active university not found");
    }

    const [course] = await db
        .insert(courses)
        .values({
            universityId: data.universityId,
            name: data.name,
            track: data.track,
            interviewFormat: data.interviewFormat,
            durationMins: data.durationMins,
            panelSize: data.panelSize,
            studentContext: data.studentContext,
            adminNotes: data.adminNotes,
        })
        .returning();

    return course;
};

export const getCourse = async (courseId: string) => {
    const result = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);

    if (!result.length) {
        throw new Error("Course not found");
    }

    return result[0];
};

export const updateCourse = async (
    courseId: string,
    data: {
        universityId?: string;
        name?: string;
        track?: "admission" | "visa";
        interviewFormat?: "mmi" | "panel" | "portfolio" | "one_on_one" | "none";
        durationMins?: number;
        panelSize?: number;
        studentContext?: string;
        adminNotes?: string;
    }
) => {
    if (data.universityId) {
        const university = await db
            .select()
            .from(universities)
            .where(
                and(
                    eq(universities.id, data.universityId),
                    eq(universities.isActive, true)
                )
            )
            .limit(1);

        if (!university.length) {
            throw new Error("Active university not found");
        }
    }

    const [course] = await db
        .update(courses)
        .set(data)
        .where(eq(courses.id, courseId))
        .returning();

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

export const deactivateCourse = async (courseId: string) => {
    const [course] = await db
        .update(courses)
        .set({
            isActive: false,
        })
        .where(eq(courses.id, courseId))
        .returning();

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

export const deleteCourse = async (courseId: string) => {
    const [course] = await db
        .delete(courses)
        .where(eq(courses.id, courseId))
        .returning();

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

export const getAllCourses = async (
    universityId?: string
) => {
    const query = db
        .select()
        .from(courses)
        .where(
            universityId
                ? and(
                    eq(courses.universityId, universityId),
                    eq(courses.isActive, true)
                )
                : eq(courses.isActive, true)
        );

    return await query;
};