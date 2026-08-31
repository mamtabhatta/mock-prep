import { eq } from "drizzle-orm";
import { db } from "../db";
import { universities } from "../db/schema";

export const createUniversity = async (data: {
    name: string;
    country?: string;
    description?: string;
  
    interviewOverview?: string;
}) => {
    const [university] = await db
        .insert(universities)
        .values({
            name: data.name,
            country: data.country ?? "United Kingdom",
            description: data.description,
            
            interviewOverview: data.interviewOverview,
        })
        .returning();

    return university;
};

export const getUniversityById = async (id: string) => {
    const [university] = await db
        .select()
        .from(universities)
        .where(eq(universities.id, id))
        .limit(1);

    return university ?? null;
};

export const updateUniversity = async (
    id: string,
    data: {
        name?: string;
        country?: string;
        description?: string;
        logoUrl?: string;
        interviewOverview?: string;
    }
) => {
    const [university] = await db
        .update(universities)
        .set(data)
        .where(eq(universities.id, id))
        .returning();

    return university ?? null;
};

export const deactivateUniversity = async (id: string) => {
    const [university] = await db
        .update(universities)
        .set({
            isActive: false,
        })
        .where(eq(universities.id, id))
        .returning();

    return university ?? null;
};

export const deleteUniversity = async (id: string) => {
    const [university] = await db
        .delete(universities)
        .where(eq(universities.id, id))
        .returning();

    return university ?? null;
};
export const getAllUniversities = async () => {
    const universityList = await db
        .select()
        .from(universities)
        .where(eq(universities.isActive, true));

    return universityList;
};
