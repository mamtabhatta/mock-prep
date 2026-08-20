import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import app from "../../app";
import { db, pool } from "../../db";

import {
    users,
    analyticsEvents,
    sessions,
} from "../../db/schema";

import { eq, inArray } from "drizzle-orm";

describe("9.6 Admin User and Analytics Flows", () => {
    let adminId: string;
    let adminToken: string;

    let testUserId: string;
    let testUserId2: string;

    const JWT_SECRET = process.env.JWT_ACCESS_SECRET!;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash(
            "Password123!",
            10
        );

        /*
         * Create test super admin
         */
        const [admin] = await db
            .insert(users)
            .values({
                email: `9.6-admin-${Date.now()}@test.com`,
                passwordHash,
                fullName: "9.6 Test Super Admin",
                role: "super_admin",
                isEmailVerified: true,
                isSuspended: false,
            })
            .returning();

        adminId = admin.id;

        /*
         * Create test student
         */
        const [testUser] = await db
            .insert(users)
            .values({
                email: `9.6-user-${Date.now()}@test.com`,
                passwordHash,
                fullName: "9.6 Test User",
                role: "student",
                isEmailVerified: true,
                isSuspended: false,
            })
            .returning();

        testUserId = testUser.id;

        /*
         * Create second test user
         */
        const [testUser2] = await db
            .insert(users)
            .values({
                email: `9.6-user2-${Date.now()}@test.com`,
                passwordHash,
                fullName: "9.6 Test User Two",
                role: "student",
                isEmailVerified: true,
                isSuspended: false,
            })
            .returning();

        testUserId2 = testUser2.id;

        /*
         * Generate JWT matching authMiddleware
         */
        adminToken = jwt.sign(
            {
                userId: adminId,
                role: "super_admin",
            },
            JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
    });

    afterAll(async () => {
        /*
         * Delete analytics events created for test users
         */
        await db
            .delete(analyticsEvents)
            .where(
                inArray(
                    analyticsEvents.userId,
                    [adminId, testUserId, testUserId2]
                )
            );

        /*
         * Delete sessions created for test users
         */
        await db
            .delete(sessions)
            .where(
                inArray(
                    sessions.userId,
                    [adminId, testUserId, testUserId2]
                )
            );

        /*
         * Delete test users
         */
        await db
            .delete(users)
            .where(
                inArray(
                    users.id,
                    [adminId, testUserId, testUserId2]
                )
            );

        await pool.end();
    });

    /*
     * =====================================================
     * ADMIN USER FLOWS
     * =====================================================
     */

    describe("Admin user flows", () => {
        it("should list users as super admin", async () => {
            const res = await request(app)
                .get("/api/v1/admin/users")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                Array.isArray(res.body.data)
            ).toBe(true);

            expect(res.body).toHaveProperty(
                "pagination"
            );

            expect(
                res.body.data.some(
                    (user: any) =>
                        user.id === testUserId
                )
            ).toBe(true);
        });

        it("should get a specific user as super admin", async () => {
            const res = await request(app)
                .get(
                    `/api/v1/admin/users/${testUserId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(res.body.data).toHaveProperty(
                "user"
            );

            expect(
                res.body.data.user.id
            ).toBe(testUserId);

            expect(
                res.body.data
            ).toHaveProperty("sessions");

            expect(
                res.body.data
            ).toHaveProperty("reports");
        });

        it("should update a user's role", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/admin/users/${testUserId}/role`
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    role: "counselor",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                res.body.data.role
            ).toBe("counselor");
        });

        it("should update a user's suspension status", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/admin/users/${testUserId}/suspension`
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    is_suspended: true,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                res.body.data.isSuspended
            ).toBe(true);
        });

        it("should reactivate a suspended user", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/admin/users/${testUserId}/suspension`
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    is_suspended: false,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                res.body.data.isSuspended
            ).toBe(false);
        });

        it("should reject unauthenticated admin requests", async () => {
            const res = await request(app)
                .get("/api/v1/admin/users");

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    /*
     * =====================================================
     * ANALYTICS
     * =====================================================
     */

    describe("Analytics endpoints", () => {
        beforeAll(async () => {
            /*
             * Create analytics events so usage
             * analytics has deterministic test data.
             */
            await db
                .insert(analyticsEvents)
                .values([
                    {
                        userId: testUserId,
                        eventType: "session_started",
                        metadata: {},
                    },
                    {
                        userId: testUserId2,
                        eventType: "session_started",
                        metadata: {},
                    },
                ]);
        });

        it("should return usage analytics", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/admin/analytics/usage"
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                Array.isArray(res.body.data)
            ).toBe(true);

            if (res.body.data.length > 0) {
                expect(
                    res.body.data[0]
                ).toHaveProperty("date");

                expect(
                    res.body.data[0]
                ).toHaveProperty("activeUsers");

                expect(
                    typeof res.body.data[0]
                        .activeUsers
                ).toBe("number");
            }
        });

        it("should return quality analytics", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/admin/analytics/quality"
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(res.body.data).toHaveProperty(
                "averageRating"
            );

            expect(res.body.data).toHaveProperty(
                "totalReports"
            );

            expect(
                typeof res.body.data.averageRating
            ).toBe("number");

            expect(
                typeof res.body.data.totalReports
            ).toBe("number");
        });

        it("should return retention analytics", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/admin/analytics/retention"
                )
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(res.body.data).toHaveProperty(
                "day7Rate"
            );

            expect(res.body.data).toHaveProperty(
                "day30Rate"
            );

            expect(
                typeof res.body.data.day7Rate
            ).toBe("number");

            expect(
                typeof res.body.data.day30Rate
            ).toBe("number"
            );
        });

        it("should reject unauthenticated analytics requests", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/admin/analytics/usage"
                );

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});