import request from "supertest";
import app from "../../app";
import { db, pool } from "../../db";
import prisma from "../../config/db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../services/storageServices", () => ({
    generatePresignedPutUrl: jest.fn().mockResolvedValue("https://mock-s3-url.com/upload"),
}));

describe("Profile Integration Tests", () => {
    const testUser = {
        fullName: "Profile Test User",
        email: "profile.test@example.com",
        password: "Password123!",
    };

    let token: string;

    beforeAll(async () => {
        await db.delete(users).where(eq(users.email, testUser.email));

        await request(app).post("/api/v1/auth/register").send(testUser);

        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        token = loginRes.body.data.accessToken;
    });

    afterAll(async () => {
        await db.delete(users).where(eq(users.email, testUser.email));
        await prisma.$disconnect();
        await pool.end();
    });

    describe("POST /api/v1/profile/documents", () => {
        it("should generate a presigned upload URL for authenticated user", async () => {
            const res = await request(app)
                .post("/api/v1/profile/documents")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    kind: "cv",
                    contentType: "application/pdf",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty("uploadUrl");
            expect(res.body).toHaveProperty("key");
            expect(res.body.key).toContain("profiles/");
        });

        it("should reject unauthenticated request", async () => {
            const res = await request(app)
                .post("/api/v1/profile/documents")
                .send({
                    kind: "cv",
                    contentType: "application/pdf",
                });

            expect(res.status).toBe(401);
        });
    });

    describe("PATCH /api/v1/profile/documents", () => {
        it("should update profile document key in database", async () => {
            const res = await request(app)
                .patch("/api/v1/profile/documents")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    kind: "cv",
                    key: "profiles/test-user/cv-12345.pdf",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty("data");
        });

        it("should reject unauthenticated request", async () => {
            const res = await request(app)
                .patch("/api/v1/profile/documents")
                .send({
                    kind: "cv",
                    key: "profiles/test-user/cv-12345.pdf",
                });

            expect(res.status).toBe(401);
        });
    });
});