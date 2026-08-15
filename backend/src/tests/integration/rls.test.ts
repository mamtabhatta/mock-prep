import { prisma } from "../../config/db";
import { runAsUser } from "../helpers/rlsHelper";

describe("Task 1.8 - RLS Integration Tests (Data Isolation)", () => {
    let studentAId: string | undefined;
    let studentBId: string | undefined;

    beforeAll(async () => {
        // 1. Create Student A
        const studentA = await prisma.users.create({
            data: {
                email: `rls_test_a_${Date.now()}@example.com`,
                password_hash: "hashed_pwd",
                full_name: "Student A",
                role: "student",
            },
        });
        studentAId = studentA.id;

        // Create Profile for Student A
        await prisma.profiles.create({
            data: {
                user_id: studentAId,
                bio: "Student A Bio",
                cv_file_url: `profiles/${studentAId}/cv.pdf`,
            },
        });

        // 2. Create Student B
        const studentB = await prisma.users.create({
            data: {
                email: `rls_test_b_${Date.now()}@example.com`,
                password_hash: "hashed_pwd",
                full_name: "Student B",
                role: "student",
            },
        });
        studentBId = studentB.id;

        // Create Profile for Student B
        await prisma.profiles.create({
            data: {
                user_id: studentBId,
                bio: "Student B Bio",
            },
        });
    });

    afterAll(async () => {
        const idsToDelete = [studentAId, studentBId].filter((id): id is string => Boolean(id));

        if (idsToDelete.length > 0) {
            await prisma.profiles.deleteMany({
                where: { user_id: { in: idsToDelete } },
            });
            await prisma.users.deleteMany({
                where: { id: { in: idsToDelete } },
            });
        }
        await prisma.$disconnect();
    });

    test("Ownership: User can read their own profile", async () => {
        const profile = await runAsUser(studentAId!, "student", async (tx) => {
            return await tx.profiles.findUnique({
                where: { user_id: studentAId },
            });
        });

        expect(profile).not.toBeNull();
        expect(profile?.user_id).toBe(studentAId);
    });

    test("Isolation: Student B cannot access Student A's profile", async () => {
        const profile = await runAsUser(studentBId!, "student", async (tx) => {
            return await tx.profiles.findFirst({
                where: { user_id: studentAId },
            });
        });

        expect(profile).toBeNull();
    });

    test("Mutation Guard: Student B cannot edit Student A's profile", async () => {
        await expect(
            runAsUser(studentBId!, "student", async (tx) => {
                return await tx.profiles.update({
                    where: { user_id: studentAId },
                    data: { bio: "Hacked bio" },
                });
            })
        ).rejects.toThrow();
    });
});