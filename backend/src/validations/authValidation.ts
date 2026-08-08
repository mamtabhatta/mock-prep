import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1),
});

export const updateProfileSchema = z.object({
    academic_background_text: z.string().optional().nullable(),
    personal_statement_text: z.string().optional().nullable(),
    ielts_target_band: z.number().min(0).max(9).optional().nullable(),
    english_self_rating: z.number().int().min(1).max(5).optional().nullable(),
    concerns_text: z.string().optional().nullable(),
    target_university_id: z.string().uuid().optional().nullable(),
    target_course_id: z.string().uuid().optional().nullable(),
    bio: z.string().optional().nullable(),
    profile_image: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;