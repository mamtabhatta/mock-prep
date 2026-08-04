import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { users, profiles } from "../db/schema";
import {
    RegisterInput,
    LoginInput,
} from "../validations/authValidation";

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

    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
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

    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
};