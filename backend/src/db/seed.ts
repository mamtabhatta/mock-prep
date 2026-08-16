import { db } from "./index";
import { prompts, universities, courses, questionSets, questions } from "./schema";
import { eq, and } from "drizzle-orm";

const DEFAULT_RUBRIC_PROMPT = `Analyze the following mock interview response for a UK Student Visa applicant. 
Evaluate clarity, compliance, credibility, and communication quality. Provide actionable suggestions for improvement.`;

async function main() {
    const existingPrompt = await db.query.prompts.findFirst({
        where: and(
            eq(prompts.module, "interview_feedback"),
            eq(prompts.version, 1)
        ),
    });

    if (!existingPrompt) {
        await db.insert(prompts).values({
            module: "interview_feedback",
            version: 1,
            contentText: DEFAULT_RUBRIC_PROMPT,
            isActive: true,
        });
    }

    let visaUni = await db.query.universities.findFirst({
        where: eq(universities.name, "UK Student Visa"),
    });

    if (!visaUni) {
        const [inserted] = await db
            .insert(universities)
            .values({
                name: "UK Student Visa",
                country: "United Kingdom",
                description: "Synthetic university record for UK Student Visa interview track",
                isActive: true,
            })
            .returning();
        visaUni = inserted;
    }

    let visaCourse = await db.query.courses.findFirst({
        where: and(
            eq(courses.universityId, visaUni.id),
            eq(courses.track, "visa")
        ),
    });

    if (!visaCourse) {
        const [inserted] = await db
            .insert(courses)
            .values({
                universityId: visaUni.id,
                name: "UK Student Visa Credibility Interview",
                track: "visa",
                interviewFormat: "one_on_one",
                durationMins: 15,
                isActive: true,
            })
            .returning();
        visaCourse = inserted;
    }

    let visaSet = await db.query.questionSets.findFirst({
        where: eq(questionSets.courseId, visaCourse.id),
    });

    if (!visaSet) {
        const [inserted] = await db
            .insert(questionSets)
            .values({
                courseId: visaCourse.id,
                name: "Standard Visa Preparation Set",
                description: "Core credibility questions for UK VI interview",
                isActive: true,
            })
            .returning();
        visaSet = inserted;
    }

    const defaultQuestions = [
        {
            text: "Why did you choose to study in the UK instead of your home country?",
            typeTag: "motivational" as const,
            difficulty: "3" as const,
            frequency: "almost_always" as const,
            orderIndex: 0,
        },
        {
            text: "How will this course help you with your future career plans?",
            typeTag: "gap_career_change" as const,
            difficulty: "3" as const,
            frequency: "almost_always" as const,
            orderIndex: 1,
        },
        {
            text: "How do you plan to finance your studies and living expenses in the UK?",
            typeTag: "situational" as const,
            difficulty: "4" as const,
            frequency: "almost_always" as const,
            orderIndex: 2,
        },
    ];

    for (const q of defaultQuestions) {
        const existingQ = await db.query.questions.findFirst({
            where: and(
                eq(questions.questionSetId, visaSet.id),
                eq(questions.text, q.text)
            ),
        });

        if (!existingQ) {
            await db.insert(questions).values({
                questionSetId: visaSet.id,
                ...q,
                isActive: true,
                version: 1,
            });
        }
    }

    const starterUniversities = [
        { name: "University of Oxford", country: "United Kingdom" },
        { name: "University of Cambridge", country: "United Kingdom" },
        { name: "Imperial College London", country: "United Kingdom" },
        { name: "University College London (UCL)", country: "United Kingdom" },
        { name: "The University of Edinburgh", country: "United Kingdom" },
        { name: "The University of Manchester", country: "United Kingdom" },
        { name: "King's College London", country: "United Kingdom" },
        { name: "University of Bristol", country: "United Kingdom" },
        { name: "University of Warwick", country: "United Kingdom" },
        { name: "University of Glasgow", country: "United Kingdom" },
    ];

    for (const uni of starterUniversities) {
        const existing = await db.query.universities.findFirst({
            where: eq(universities.name, uni.name),
        });

        if (!existing) {
            await db.insert(universities).values({
                ...uni,
                isActive: true,
            });
        }
    }

    process.exit(0);
}

main().catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
});