import { and, count, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users";

interface GetAdminUsersParams {
    currentUserId: string;
    search?: string;
    role?: "student" | "counselor" | "super_admin";
    isSuspended?: boolean;
    page: number;
    limit: number;
}

export const getAdminUsersService = async ({
    currentUserId,
    search,
    role,
    isSuspended,
    page,
    limit,
}: GetAdminUsersParams) => {
    const conditions = [];

    // Exclude the currently logged-in admin
    conditions.push(ne(users.id, currentUserId));

    if (search) {
        conditions.push(
            or(
                ilike(users.email, `%${search}%`),
                ilike(users.fullName, `%${search}%`)
            )
        );
    }

    if (role) {
        conditions.push(eq(users.role, role));
    }

    if (isSuspended !== undefined) {
        conditions.push(eq(users.isSuspended, isSuspended));
    }

    const whereCondition = and(...conditions);

    const offset = (page - 1) * limit;

    const [userList, totalResult] = await Promise.all([
        db
            .select({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                role: users.role,
                isEmailVerified: users.isEmailVerified,
                isSuspended: users.isSuspended,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(whereCondition)
            .limit(limit)
            .offset(offset),

        db
            .select({ count: count() })
            .from(users)
            .where(whereCondition),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    return {
        users: userList,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};