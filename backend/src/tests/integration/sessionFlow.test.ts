import request from "supertest";
import app from "../../app";

import { db, pool } from "../../db";
import prisma from "../../config/db";

import {
    users,
    sessions,
    sessionAnswers,
    questions,
} from "../../db/schema";

import { eq } from "drizzle-orm";

import * as storageServices from "../../services/storageServices";


jest.mock("../../services/storageServices", () => ({
    uploadAudio: jest
        .fn()
        .mockResolvedValue("mock-audio-key"),

    deleteObject: jest
        .fn()
        .mockResolvedValue(undefined),

    generatePresignedPutUrl: jest
        .fn()
        .mockResolvedValue(
            "https://mock-s3-url.com/upload"
        ),
}));


describe("Session Integration Tests", () => {

    const testUser = {
        fullName: "Session Test User",
        email: "session.test@example.com",
        password: "Password123!",
    };

    let token: string;
    let sessionId: string;
    let questionId: string;
    let answerId: string;


    beforeAll(async () => {

        await db
            .delete(users)
            .where(
                eq(
                    users.email,
                    testUser.email
                )
            );


        const registerRes =
            await request(app)
                .post("/api/v1/auth/register")
                .send(testUser);

        expect([200, 201]).toContain(
            registerRes.status
        );


        const loginRes =
            await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

        expect(loginRes.status).toBe(200);

        token =
            loginRes.body.data.accessToken;

        expect(token).toBeDefined();


        const questionResult =
            await db
                .select()
                .from(questions)
                .limit(1);

        expect(
            questionResult.length
        ).toBeGreaterThan(0);

        questionId =
            questionResult[0].id;
    });


    afterAll(async () => {

        await db
            .delete(users)
            .where(
                eq(
                    users.email,
                    testUser.email
                )
            );

        await prisma.$disconnect();

        await pool.end();
    });


    describe("POST /api/v1/sessions", () => {

        it("should create a new session", async () => {

            const res =
                await request(app)
                    .post("/api/v1/sessions")
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .send({
                        module: "interview",
                    });


            expect(res.status).toBe(201);

            expect(
                res.body.success
            ).toBe(true);

            expect(
                res.body.data
            ).toHaveProperty("id");

            expect(
                res.body.data.userId
            ).toBeDefined();

            expect(
                res.body.data.module
            ).toBe("interview");

            expect(
                res.body.data.status
            ).toBe("in_progress");


            sessionId =
                res.body.data.id;
        });


        it("should reject unauthenticated session creation", async () => {

            const res =
                await request(app)
                    .post("/api/v1/sessions")
                    .send({
                        module: "interview",
                    });


            expect(res.status).toBe(401);
        });
    });


    describe("GET /api/v1/sessions/:sessionId", () => {

        it("should return the created session", async () => {

            const res =
                await request(app)
                    .get(
                        `/api/v1/sessions/${sessionId}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(res.status).toBe(200);

            expect(
                res.body.success
            ).toBe(true);

            expect(
                res.body.data.id
            ).toBe(sessionId);

            expect(
                res.body.data.userId
            ).toBeDefined();

            expect(
                res.body.data.answers
            ).toEqual([]);

            expect(
                res.body.data.feedbackReport
            ).toBeNull();
        });


        it("should reject unauthenticated detail request", async () => {

            const res =
                await request(app)
                    .get(
                        `/api/v1/sessions/${sessionId}`
                    );


            expect(res.status).toBe(401);
        });
    });


    describe("POST /api/v1/sessions/:sessionId/answers", () => {

        it("should upload an audio answer", async () => {

            const audioBuffer =
                Buffer.from(
                    "fake audio data"
                );


            const res =
                await request(app)
                    .post(
                        `/api/v1/sessions/${sessionId}/answers`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .field(
                        "questionId",
                        questionId
                    )
                    .field(
                        "durationSeconds",
                        "30"
                    )
                    .attach(
                        "audio",
                        audioBuffer,
                        {
                            filename:
                                "answer.webm",
                            contentType:
                                "audio/webm",
                        }
                    );


            expect(res.status).toBe(201);

            expect(
                res.body.success
            ).toBe(true);

            expect(
                res.body.message
            ).toBe(
                "Answer uploaded successfully"
            );

            expect(
                res.body.data
            ).toHaveProperty("id");

            expect(
                res.body.data.sessionId
            ).toBe(sessionId);

            expect(
                res.body.data.questionId
            ).toBe(questionId);

            expect(
                res.body.data.recordingUrl
            ).toBeDefined();

            expect(
                res.body.data.durationSeconds
            ).toBe(30);


            answerId =
                res.body.data.id;
        });


        it("should reject answer upload without audio", async () => {

            const res =
                await request(app)
                    .post(
                        `/api/v1/sessions/${sessionId}/answers`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .field(
                        "questionId",
                        questionId
                    )
                    .field(
                        "durationSeconds",
                        "30"
                    );


            expect(res.status).toBe(400);

            expect(
                res.body.success
            ).toBe(false);
        });


        it("should reject unauthenticated answer upload", async () => {

            const audioBuffer =
                Buffer.from(
                    "fake audio data"
                );


            const res =
                await request(app)
                    .post(
                        `/api/v1/sessions/${sessionId}/answers`
                    )
                    .field(
                        "questionId",
                        questionId
                    )
                    .field(
                        "durationSeconds",
                        "30"
                    )
                    .attach(
                        "audio",
                        audioBuffer,
                        {
                            filename:
                                "answer.webm",
                            contentType:
                                "audio/webm",
                        }
                    );


            expect(res.status).toBe(401);
        });
    });


    describe("Session detail after answer upload", () => {

        it("should return the uploaded answer", async () => {

            const res =
                await request(app)
                    .get(
                        `/api/v1/sessions/${sessionId}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(res.status).toBe(200);

            expect(
                res.body.data.answers
            ).toHaveLength(1);


            const answer =
                res.body.data.answers[0];


            expect(
                answer.id
            ).toBe(answerId);

            expect(
                answer.sessionId
            ).toBe(sessionId);

            expect(
                answer.questionId
            ).toBe(questionId);

            expect(
                answer.recordingUrl
            ).toBeDefined();
        });
    });


    describe("DELETE /api/v1/sessions/:sessionId", () => {

        it("should delete the session and clean up storage", async () => {

            const res =
                await request(app)
                    .delete(
                        `/api/v1/sessions/${sessionId}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(res.status).toBe(200);

            expect(
                res.body.success
            ).toBe(true);

            expect(
                res.body.message
            ).toBe(
                "Session deleted successfully"
            );

            expect(
                res.body.data.id
            ).toBe(sessionId);

            expect(
                res.body.data.deleted
            ).toBe(true);


            // Verify storage cleanup
            expect(
                storageServices.deleteObject
            ).toHaveBeenCalled();

        });


        it("should no longer find the deleted session", async () => {

            const res =
                await request(app)
                    .get(
                        `/api/v1/sessions/${sessionId}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(
                res.status
            ).not.toBe(200);
        });


        it("should cascade delete session answers", async () => {

            const answers =
                await db
                    .select()
                    .from(sessionAnswers)
                    .where(
                        eq(
                            sessionAnswers.sessionId,
                            sessionId
                        )
                    );


            expect(
                answers
            ).toHaveLength(0);
        });


        it("should remove the session from the database", async () => {

            const result =
                await db
                    .select()
                    .from(sessions)
                    .where(
                        eq(
                            sessions.id,
                            sessionId
                        )
                    );


            expect(
                result
            ).toHaveLength(0);
        });
    });
});