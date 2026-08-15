import request from "supertest";
import app from "../../app";
import { db, pool } from "../../db";
import {
    universities,
    courses,
    questionSets,
    questions,
} from "../../db/schema";
import { inArray } from "drizzle-orm";

describe("Content API Integration Tests", () => {
    let activeUniId: string;
    let inactiveUniId: string;
    let activeCourseId: string;
    let inactiveCourseId: string;
    let activeSet1Id: string;
    let activeSet2Id: string;
    let inactiveSetId: string;

    beforeAll(async () => {
        const [activeUni] = await db
            .insert(universities)
            .values({
                name: "Test Active University",
                country: "Nepal",
                isActive: true,
            })
            .returning();
        activeUniId = activeUni.id;

        const [inactiveUni] = await db
            .insert(universities)
            .values({
                name: "Test Inactive University",
                country: "Nepal",
                isActive: false,
            })
            .returning();
        inactiveUniId = inactiveUni.id;

        const [activeCourse] = await db
            .insert(courses)
            .values({
                universityId: activeUniId,
                name: "Test Active Course",
                track: "admission",
                isActive: true,
            })
            .returning();
        activeCourseId = activeCourse.id;

        const [inactiveCourse] = await db
            .insert(courses)
            .values({
                universityId: activeUniId,
                name: "Test Inactive Course",
                track: "admission",
                isActive: false,
            })
            .returning();
        inactiveCourseId = inactiveCourse.id;

        const [set1] = await db
            .insert(questionSets)
            .values({
                courseId: activeCourseId,
                name: "Question Set 1 (Earlier)",
                isActive: true,
                createdAt: new Date("2026-01-01T00:00:00Z"),
            })
            .returning();
        activeSet1Id = set1.id;

        const [set2] = await db
            .insert(questionSets)
            .values({
                courseId: activeCourseId,
                name: "Question Set 2 (Later)",
                isActive: true,
                createdAt: new Date("2026-01-02T00:00:00Z"),
            })
            .returning();
        activeSet2Id = set2.id;

        const [inactiveSet] = await db
            .insert(questionSets)
            .values({
                courseId: activeCourseId,
                name: "Inactive Question Set",
                isActive: false,
            })
            .returning();
        inactiveSetId = inactiveSet.id;

        await db.insert(questions).values([
            {
                questionSetId: activeSet1Id,
                text: "Question Order 2",
                orderIndex: 2,
                isActive: true,
            },
            {
                questionSetId: activeSet1Id,
                text: "Question Order 1",
                orderIndex: 1,
                isActive: true,
            },
            {
                questionSetId: activeSet1Id,
                text: "Inactive Question",
                orderIndex: 0,
                isActive: false,
            },
        ]);
    });

    afterAll(async () => {
        const setIds = [activeSet1Id, activeSet2Id, inactiveSetId].filter(Boolean);
        if (setIds.length > 0) {
            await db.delete(questions).where(inArray(questions.questionSetId, setIds));
            await db.delete(questionSets).where(inArray(questionSets.id, setIds));
        }

        const courseIds = [activeCourseId, inactiveCourseId].filter(Boolean);
        if (courseIds.length > 0) {
            await db.delete(courses).where(inArray(courses.id, courseIds));
        }

        const uniIds = [activeUniId, inactiveUniId].filter(Boolean);
        if (uniIds.length > 0) {
            await db.delete(universities).where(inArray(universities.id, uniIds));
        }

        await pool.end();
    });

    describe("GET /api/v1/universities", () => {
        it("should fetch only active universities", async () => {
            const res = await request(app).get("/api/v1/universities");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            const returnedIds = res.body.data.map((u: any) => u.id);
            expect(returnedIds).toContain(activeUniId);
            expect(returnedIds).not.toContain(inactiveUniId);
        });
    });

    describe("GET /api/v1/universities/:universityId/courses", () => {
        it("should fetch only active courses for a specific university", async () => {
            const res = await request(app).get(
                `/api/v1/universities/${activeUniId}/courses`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const returnedIds = res.body.data.map((c: any) => c.id);
            expect(returnedIds).toContain(activeCourseId);
            expect(returnedIds).not.toContain(inactiveCourseId);
        });
    });

    describe("GET /api/v1/courses/:courseId/question-sets", () => {
        it("should fetch active question sets ordered by createdAt ascending", async () => {
            const res = await request(app).get(
                `/api/v1/courses/${activeCourseId}/question-sets`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const returnedSets = res.body.data;
            const returnedIds = returnedSets.map((s: any) => s.id);

            expect(returnedIds).toContain(activeSet1Id);
            expect(returnedIds).toContain(activeSet2Id);
            expect(returnedIds).not.toContain(inactiveSetId);

            const index1 = returnedIds.indexOf(activeSet1Id);
            const index2 = returnedIds.indexOf(activeSet2Id);
            expect(index1).toBeLessThan(index2);
        });
    });

    describe("GET /api/v1/question-sets/:setId/questions", () => {
        it("should fetch active questions ordered by orderIndex ascending", async () => {
            const res = await request(app).get(
                `/api/v1/question-sets/${activeSet1Id}/questions`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const returnedQuestions = res.body.data;
            expect(returnedQuestions.length).toBe(2);

            expect(returnedQuestions[0].orderIndex).toBe(1);
            expect(returnedQuestions[1].orderIndex).toBe(2);
        });
    });
});