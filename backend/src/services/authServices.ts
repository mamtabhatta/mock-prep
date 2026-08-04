import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { users, profiles, refreshTokens } from "../db/schema";

import {
    RegisterInput,
    LoginInput,
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

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    const { email, password } = data;

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};