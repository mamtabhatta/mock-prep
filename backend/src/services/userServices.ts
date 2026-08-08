import { eq } from "drizzle-orm";
import { db } from "../db";
import { profiles } from "../db/schema/profiles";
import { users } from "../db/schema/users";
import { UpdateProfileInput } from "../validations/authValidation";

export const getUserProfileService = async (userId: string) => {
    const result = await db
        .select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            profile: profiles,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, userId))
        .limit(1);

    return result[0] || null;
};

export const updateUserProfileService = async (
    userId: string,
    data: UpdateProfileInput
) => {
    const [updatedProfile] = await db
        .insert(profiles)
        .values({
            userId,
            academicBackgroundText: data.academic_background_text,
            personalStatementText: data.personal_statement_text,
            ieltsTargetBand: data.ielts_target_band,
            englishSelfRating: data.english_self_rating,
            concernsText: data.concerns_text,
            targetUniversityId: data.target_university_id,
            targetCourseId: data.target_course_id,
            bio: data.bio,
            profileImage: data.profile_image,
            country: data.country,
        })
        .onConflictDoUpdate({
            target: profiles.userId,
            set: {
                ...(data.academic_background_text !== undefined && {
                    academicBackgroundText: data.academic_background_text,
                }),
                ...(data.personal_statement_text !== undefined && {
                    personalStatementText: data.personal_statement_text,
                }),
                ...(data.ielts_target_band !== undefined && {
                    ieltsTargetBand: data.ielts_target_band,
                }),
                ...(data.english_self_rating !== undefined && {
                    englishSelfRating: data.english_self_rating,
                }),
                ...(data.concerns_text !== undefined && {
                    concernsText: data.concerns_text,
                }),
                ...(data.target_university_id !== undefined && {
                    targetUniversityId: data.target_university_id,
                }),
                ...(data.target_course_id !== undefined && {
                    targetCourseId: data.target_course_id,
                }),
                ...(data.bio !== undefined && {
                    bio: data.bio,
                }),
                ...(data.profile_image !== undefined && {
                    profileImage: data.profile_image,
                }),
                ...(data.country !== undefined && {
                    country: data.country,
                }),
                updatedAt: new Date(),
            },
        })
        .returning();

    return updatedProfile;
};
