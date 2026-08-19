import { and, count, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users";
import { feedbackReports } from "../db/schema/feedbackReports";
import { sessions } from "../db/schema/sessions";

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
export const getAdminUserDetailService = async (userId: string) => {
    const [user] = await db
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
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        return null;
    }

    const userSessions = await db
        .select({
            id: sessions.id,
            userId: sessions.userId,
            module: sessions.module,
            universityId: sessions.universityId,
            courseId: sessions.courseId,
            questionSetId: sessions.questionSetId,
            status: sessions.status,
            startedAt: sessions.startedAt,
            submittedAt: sessions.submittedAt,
            scoredAt: sessions.scoredAt,
            createdAt: sessions.createdAt,
        })
        .from(sessions)
        .where(eq(sessions.userId, userId));

    const sessionIds = userSessions.map((session) => session.id);

    const reports =
        sessionIds.length > 0
            ? await db
                .select({
                    id: feedbackReports.id,
                    sessionId: feedbackReports.sessionId,
                    quickSnapshotJson:
                        feedbackReports.quickSnapshotJson,
                    deepReportJson:
                        feedbackReports.deepReportJson,
                    scoresJson: feedbackReports.scoresJson,
                    aiFeedbackJson:
                        feedbackReports.aiFeedbackJson,
                    counselorFeedbackJson:
                        feedbackReports.counselorFeedbackJson,
                    reviewedBy: feedbackReports.reviewedBy,
                    status: feedbackReports.status,
                    createdAt: feedbackReports.createdAt,
                })
                .from(feedbackReports)
                .where(
                    or(
                        ...sessionIds.map((sessionId) =>
                            eq(
                                feedbackReports.sessionId,
                                sessionId
                            )
                        )
                    )
                )
            : [];

    return {
        user,
        sessions: userSessions,
        reports,
    };
};
export const updateAdminUserRoleService = async (
    userId: string,
    role: "student" | "counselor" | "super_admin"
) => {
    const [updatedUser] = await db
        .update(users)
        .set({
            role,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            role: users.role,
            isSuspended: users.isSuspended,
            updatedAt: users.updatedAt,
        });

    return updatedUser || null;
};

export const updateAdminUserSuspensionService = async (
    userId: string,
    isSuspended: boolean
) => {
    const [updatedUser] = await db
        .update(users)
        .set({
            isSuspended,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            role: users.role,
            isSuspended: users.isSuspended,
            updatedAt: users.updatedAt,
        });

    return updatedUser || null;
};