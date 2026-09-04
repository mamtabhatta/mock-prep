import { OAuth2Client } from "google-auth-library";
import { eq } from "drizzle-orm";

import { db } from "../db";
import {
    users,
    profiles,
    refreshTokens,
} from "../db/schema";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

export const getGoogleAuthUrl = () => {
    return googleClient.generateAuthUrl({
        access_type: "offline",
        scope: [
            "openid",
            "email",
            "profile",
        ],
        prompt: "select_account",
    });
};

export const handleGoogleCallback = async (code: string) => {
    if (!code) {
        throw new Error("Google authorization code is required");
    }

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
        throw new Error("Google ID token was not returned");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
        throw new Error("Unable to verify Google account");
    }

    const {
        sub: googleId,
        email,
        name,
        email_verified: emailVerified,
    } = payload;

    if (!googleId) {
        throw new Error("Google account ID is missing");
    }

    if (!email) {
        throw new Error("Google account email is missing");
    }

    if (!emailVerified) {
        throw new Error("Google email is not verified");
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await db.query.users.findFirst({
        where: eq(users.googleId, googleId),
    });

    /*
     * Existing Google account
     */
    if (user) {
        if (user.isSuspended) {
            throw new Error("Your account has been suspended");
        }
    } else {
        /*
         * Check whether the email already belongs
         * to an existing email/password account.
         */
        user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (user) {
            /*
             * Link Google to the existing account.
             *
             * This is safe because Google has already
             * verified ownership of the email.
             */
            if (user.isSuspended) {
                throw new Error("Your account has been suspended");
            }

            const [updatedUser] = await db
                .update(users)
                .set({
                    googleId,
                    isEmailVerified: true,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id))
                .returning();

            user = updatedUser;
        } else {
            /*
             * Completely new Google account.
             */
            const createdUser = await db.transaction(async (tx) => {
                const [newUser] = await tx
                    .insert(users)
                    .values({
                        email: normalizedEmail,
                        fullName: name || "Google User",
                        googleId,
                        passwordHash: null,
                        role: "student",
                        isEmailVerified: true,
                    })
                    .returning();

                await tx.insert(profiles).values({
                    userId: newUser.id,
                });

                return newUser;
            });

            user = createdUser;
        }
    }

    /*
     * Generate the exact same authentication
     * tokens used by normal login.
     */
    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

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