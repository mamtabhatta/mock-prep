import { and, eq } from "drizzle-orm";

import { db } from "../db";
import { courses, universities } from "../db/schema";

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