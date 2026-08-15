import request from "supertest";
import app from "../../app";
import { db, pool } from "../../db"; 
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

describe("Auth Integration Tests", () => {
    const testUser = {
        fullName: "Test User",
        email: "test@example.com",
        password: "Password123!",
    };

    beforeEach(async () => {
        await db.delete(users).where(eq(users.email, testUser.email));
    });

    afterAll(async () => {
        await db.delete(users).where(eq(users.email, testUser.email));
        await pool.end(); 
    });

    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.data.user).toHaveProperty("email", testUser.email);
    });

    it("should login user and return tokens", async () => {
        await request(app).post("/api/v1/auth/register").send(testUser);

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("accessToken");
        expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("should get current user profile with access token", async () => {
        await request(app).post("/api/v1/auth/register").send(testUser);

        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        const token = loginRes.body.data.accessToken;

        const res = await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("userId");
    });

    it("should refresh access token", async () => {
        await request(app).post("/api/v1/auth/register").send(testUser);

        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        const currentRefreshToken = loginRes.body.data.refreshToken;

        const res = await request(app)
            .post("/api/v1/auth/refresh")
            .send({ refreshToken: currentRefreshToken });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("accessToken");
    });
});