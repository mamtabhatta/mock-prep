import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import crypto from "crypto";

import { db } from "../db";
import {
    users,
    profiles,
    refreshTokens,
    emailTokens,
} from "../db/schema";

import {
    RegisterInput,
    LoginInput,
    ForgotPasswordInput,
    ResetPasswordInput,
} from "../validations/authValidation";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt";

export const register = async (data: RegisterInput) => {
    const { fullName, email, password } = data;

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.transaction(async (tx) => {
        const [newUser] = await tx
            .insert(users)
            .values({
                fullName,
                email,
                passwordHash,
            })
            .returning();

        await tx.insert(profiles).values({
            userId: newUser.id,
        });

        return newUser;
    });

    await sendVerificationEmail(user.id);

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
    });

    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken,
    };
};

export const login = async (data: LoginInput) => {
    const { email, password, rememberMe } = data;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
    });

    if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
    }

    if (user.isSuspended) {
        throw new Error("Your account has been suspended");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    const refreshToken = generateRefreshToken(
        user.id,
        rememberMe
    );

    const refreshTokenExpiry = rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(
            Date.now() + refreshTokenExpiry
        ),
    });

    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken,
    };
};

export const refresh = async (token: string) => {
    if (!token) {
        throw new Error("Refresh token is required");
    }

    const storedToken = await db.query.refreshTokens.findFirst({
        where: eq(refreshTokens.token, token),
    });

    if (!storedToken || storedToken.isRevoked) {
        throw new Error("Invalid refresh token");
    }

    if (new Date() > storedToken.expiresAt) {
        throw new Error("Refresh token has expired");
    }

    const payload = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!
    ) as {
        userId: string;
    };

    const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
    });

    if (!user) {
        throw new Error("User not found");
    }

    await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.id, storedToken.id));

    const newAccessToken = generateAccessToken(
        user.id,
        user.role
    );

    const remainingTime =
        storedToken.expiresAt.getTime() - Date.now();

    const rememberMe =
        remainingTime > 7 * 24 * 60 * 60 * 1000;

    const newRefreshToken = generateRefreshToken(
        user.id,
        rememberMe
    );

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(
            Date.now() + remainingTime
        ),
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

export const forgotPassword = async (data: ForgotPasswordInput) => {
    const { email } = data;

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.insert(emailTokens).values({
        userId: user.id,
        token,
        type: "password_reset",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetUrl =
        `http://localhost:5173/reset-password?token=${token}`;

    console.log(`Reset Link: ${resetUrl}`);

    return {
        message: "Reset Link generated successfully",
        resetUrl,
    };
};

export const resetPassword = async (data: ResetPasswordInput) => {
    const { token, password } = data;

    if (!token) {
        throw new Error("Token is required");
    }

    const cleanToken = token.trim();

    const storedToken = await db.query.emailTokens.findFirst({
        where: eq(emailTokens.token, cleanToken),
    });

    if (!storedToken || storedToken.isUsed) {
        throw new Error("Invalid or already used token");
    }

    if (new Date() > storedToken.expiresAt) {
        throw new Error("Token has expired");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.transaction(async (tx) => {
        await tx
            .update(users)
            .set({ passwordHash })
            .where(eq(users.id, storedToken.userId));

        await tx
            .update(emailTokens)
            .set({ isUsed: true })
            .where(eq(emailTokens.id, storedToken.id));
    });

    return {
        message: "Password reset successful",
    };
};

export const sendVerificationEmail = async (userId: string) => {
    const token = crypto.randomBytes(32).toString("hex");

    await db.insert(emailTokens).values({
        userId,
        token,
        type: "email_verification",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    console.log(`Verification Link: http://localhost:5000/api/v1/auth/verify-email?token=${token}`);

    return {
        message: "Verification email sent successfully",
    };
};

export const verifyEmail = async (token: string) => {
    if (!token) {
        throw new Error("Token is required");
    }

    const cleanToken = token.trim();

    const storedToken = await db.query.emailTokens.findFirst({
        where: eq(emailTokens.token, cleanToken),
    });

    if (
        !storedToken ||
        storedToken.type !== "email_verification" ||
        storedToken.isUsed
    ) {
        throw new Error("Invalid or already used token");
    }

    if (new Date() > storedToken.expiresAt) {
        throw new Error("Token has expired");
    }

    await db.transaction(async (tx) => {
        await tx
            .update(users)
            .set({ isEmailVerified: true })
            .where(eq(users.id, storedToken.userId));

        await tx
            .update(emailTokens)
            .set({ isUsed: true })
            .where(eq(emailTokens.id, storedToken.id));
    });

    return {
        message: "Email verified successfully",
    };
};