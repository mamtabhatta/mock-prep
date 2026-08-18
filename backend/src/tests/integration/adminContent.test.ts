import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import app from "../../app";
import { db, pool } from "../../db";

import {
    users,
    universities,
    courses,
    questionSets,
    questions,
    prompts,
} from "../../db/schema";

import { eq, inArray } from "drizzle-orm";

describe("7.7 Admin Content, Prompt, CSV and Preview Flows", () => {
    let adminId: string;
    let token: string;

    let universityId: string;
    let courseId: string;
    let questionSetId: string;

    let question1Id: string;
    let question2Id: string;

    let promptV1Id: string;
    let promptV2Id: string;

    const JWT_SECRET = process.env.JWT_ACCESS_SECRET!;

    beforeAll(async () => {
        /*
         * Create test super admin
         */
        const passwordHash = await bcrypt.hash(
            "Password123!",
            10
        );

        const [admin] = await db
            .insert(users)
            .values({
                email: `admin-${Date.now()}@test.com`,
                passwordHash,
                fullName: "Test Super Admin",
                role: "super_admin",
                isEmailVerified: true,
                isSuspended: false,
            })
            .returning();

        adminId = admin.id;

        /*
         * Generate JWT matching authMiddleware
         */
        token = jwt.sign(
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
         * Delete questions first
         */
        if (questionSetId) {
            await db
                .delete(questions)
                .where(
                    eq(
                        questions.questionSetId,
                        questionSetId
                    )
                );
        }

        /*
         * Delete question set
         */
        if (questionSetId) {
            await db
                .delete(questionSets)
                .where(
                    eq(
                        questionSets.id,
                        questionSetId
                    )
                );
        }

        /*
         * Delete course
         */
        if (courseId) {
            await db
                .delete(courses)
                .where(
                    eq(courses.id, courseId)
                );
        }

        /*
         * Delete university
         */
        if (universityId) {
            await db
                .delete(universities)
                .where(
                    eq(universities.id, universityId)
                );
        }

        /*
         * Delete test prompts
         */
        await db
            .delete(prompts)
            .where(
                inArray(
                    prompts.id,
                    [promptV1Id, promptV2Id].filter(
                        Boolean
                    )
                )
            );

        /*
         * Delete admin
         */
        if (adminId) {
            await db
                .delete(users)
                .where(eq(users.id, adminId));
        }

        await pool.end();
    });

    /*
     * =====================================================
     * UNIVERSITY
     * =====================================================
     */

    describe("University CRUD", () => {
        it("should create a university", async () => {
            const res = await request(app)
                .post("/api/v1/universities")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: `7.7 Test University ${Date.now()}`,
                    country: "Nepal",
                    isActive: true,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("id");

            universityId = res.body.data.id;
        });

        it("should update the university", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/universities/${universityId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "7.7 Updated University",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(
                "7.7 Updated University"
            );
        });

        it("should deactivate the university", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/universities/${universityId}/deactivate`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should delete the university", async () => {
            /*
             * Reactivate/update may not be necessary depending
             * on service implementation. This test verifies
             * the endpoint itself.
             */
            const res = await request(app)
                .delete(
                    `/api/v1/universities/${universityId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

            expect([200, 204]).toContain(
                res.status
            );

            universityId = "";
        });
    });

    /*
     * =====================================================
     * COURSE
     * =====================================================
     */

    describe("Course CRUD", () => {
        beforeAll(async () => {
            const [university] = await db
                .insert(universities)
                .values({
                    name: `7.7 Course University ${Date.now()}`,
                    country: "Nepal",
                    isActive: true,
                })
                .returning();

            universityId = university.id;
        });

        it("should create a course", async () => {
            const res = await request(app)
                .post("/api/v1/courses")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    universityId,
                    name: `7.7 Test Course ${Date.now()}`,
                    track: "admission",
                    isActive: true,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("id");

            courseId = res.body.data.id;
        });

        it("should update the course", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/courses/${courseId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "7.7 Updated Course",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should deactivate the course", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/courses/${courseId}/deactivate`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    /*
     * =====================================================
     * QUESTION SET
     * =====================================================
     */

    describe("Question Set CRUD", () => {
        beforeAll(async () => {
            /*
             * Course must be active for question set creation
             */
            await db
                .update(courses)
                .set({
                    isActive: true,
                })
                .where(
                    eq(courses.id, courseId)
                );
        });

        it("should create a question set", async () => {
            const res = await request(app)
                .post("/api/v1/question-sets")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    courseId,
                    name: "7.7 Test Question Set",
                    description:
                        "Question set for integration testing",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("id");

            questionSetId =
                res.body.data.id;
        });

        it("should update the question set", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/question-sets/${questionSetId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "7.7 Updated Question Set",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    /*
     * =====================================================
     * QUESTIONS
     * =====================================================
     */

    describe("Question CRUD and reorder", () => {
        it("should create question 1", async () => {
            const res = await request(app)
                .post("/api/v1/questions")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    questionSetId,
                    text: "7.7 Test Question One",
                    typeTag: "motivational",
                    difficulty: "3",
                    frequency: "common",
                    orderIndex: 0,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            question1Id =
                res.body.data.id;
        });

        it("should create question 2", async () => {
            const res = await request(app)
                .post("/api/v1/questions")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    questionSetId,
                    text: "7.7 Test Question Two",
                    typeTag: "situational",
                    difficulty: "4",
                    frequency: "common",
                    orderIndex: 1,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            question2Id =
                res.body.data.id;
        });

        it("should update a question", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/questions/${question1Id}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    text: "7.7 Updated Question One",
                    difficulty: "4",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.text).toBe(
                "7.7 Updated Question One"
            );
        });

        it("should reorder questions", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/question-sets/${questionSetId}/questions/reorder`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    questionIds: [
                        question2Id,
                        question1Id,
                    ],
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should return questions in reordered order", async () => {
            const res = await request(app)
                .get(
                    `/api/v1/question-sets/${questionSetId}/questions`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                res.body.data[0].id
            ).toBe(question2Id);

            expect(
                res.body.data[1].id
            ).toBe(question1Id);
        });

        it("should delete a question", async () => {
            const res = await request(app)
                .delete(
                    `/api/v1/questions/${question1Id}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    /*
     * =====================================================
     * CSV BULK IMPORT
     * =====================================================
     */

    describe("CSV bulk import", () => {
        it("should import questions from CSV", async () => {
            const csv = [
                "questionSetId,text,typeTag,difficulty,frequency,orderIndex",
                `${questionSetId},"What are your career plans?","motivational","3","common","10"`,
                `${questionSetId},"How will you adapt abroad?","situational","3","common","11"`,
            ].join("\n");

            const res = await request(app)
                .post(
                    "/api/v1/questions/bulk-import"
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .attach(
                    "file",
                    Buffer.from(csv),
                    "questions.csv"
                );

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(
                res.body.data.length
            ).toBe(2);
        });
    });

    /*
     * =====================================================
     * PROMPT LIFECYCLE
     * =====================================================
     */

    describe("Prompt lifecycle", () => {
        it("should create prompt version 1", async () => {
            const res = await request(app)
                .post("/api/v1/prompts")
                .send({
                    module: "ielts_speaking",
                    contentText:
                        "Evaluate IELTS speaking response for fluency, vocabulary and grammar.",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.version).toBe(1);

            promptV1Id =
                res.body.data.id;
        });

        it("should create prompt version 2", async () => {
            const res = await request(app)
                .post("/api/v1/prompts")
                .send({
                    module: "ielts_speaking",
                    contentText:
                        "Evaluate IELTS speaking response with detailed scoring and recommendations.",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.version).toBe(2);

            promptV2Id =
                res.body.data.id;
        });

        it("should return prompt version history", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/prompts/module/ielts_speaking"
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            expect(
                res.body.data.length
            ).toBeGreaterThanOrEqual(2);

            const versions =
                res.body.data.map(
                    (p: any) => p.version
                );

            expect(versions).toContain(1);
            expect(versions).toContain(2);
        });

        it("should activate prompt version 2", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/prompts/${promptV2Id}/activate`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should return version 2 as active", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/prompts/module/ielts_speaking/active"
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(
                promptV2Id
            );
            expect(res.body.data.isActive).toBe(
                true
            );
        });

        it("should rollback to version 1", async () => {
            const res = await request(app)
                .patch(
                    `/api/v1/prompts/${promptV1Id}/rollback`
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should return version 1 as active after rollback", async () => {
            const res = await request(app)
                .get(
                    "/api/v1/prompts/module/ielts_speaking/active"
                );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(
                promptV1Id
            );
            expect(res.body.data.isActive).toBe(
                true
            );
        });
    });

    /*
     * =====================================================
     * PROMPT PREVIEW
     * =====================================================
     */

    describe("Prompt preview", () => {
        it("should return a usable AI preview result", async () => {
            const res = await request(app)
                .post("/api/v1/prompts/preview")
                .send({
                    module: "interview_feedback",
                    transcript:
                        "I chose the UK because the university offers a strong course related to my career goals.",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();

            expect(
                res.body.data.promptId
            ).toBeDefined();

            expect(
                res.body.data.version
            ).toBeDefined();

            expect(
                res.body.data.module
            ).toBe("interview_feedback");

            expect(
                res.body.data.output
            ).toBeDefined();

            expect(
                typeof res.body.data.output
            ).toBe("string");

            expect(
                res.body.data.output.length
            ).toBeGreaterThan(0);
        });
    });
});