import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NextStepsCard({ report }) {
    const navigate = useNavigate();

    const aiFeedback =
        report?.feedbackReport?.aiFeedbackJson || {};

    const recommendations =
        Array.isArray(aiFeedback.recommendations)
            ? aiFeedback.recommendations
            : [];


    const steps =
        recommendations.length > 0
            ? recommendations
            : [
                "Review your weaker answers.",
                "Practice answering with a clearer structure.",
                "Focus on giving specific examples.",
            ];

    // ============================================
    // GET WEAK QUESTIONS
    // ============================================

    const questions = report?.questions || [];

    const answerFeedback =
        Array.isArray(aiFeedback.answer_feedback)
            ? aiFeedback.answer_feedback
            : [];

    const weakQuestions = questions.filter((question) => {
        const feedback = answerFeedback.find(
            (item) =>
                String(item.question_id) ===
                String(question.id)
        );

        if (!feedback) {
            return false;
        }

        const rawScore =
            feedback.score ??
            feedback.overall_score ??
            feedback.overallScore ??
            0;

        const score = Number(rawScore);

        if (isNaN(score)) {
            return false;
        }

        // Convert /100 score to /10 if necessary
        const normalizedScore =
            score > 10
                ? score / 10
                : score;

        // Anything below 6/10 is considered weak
        return normalizedScore < 6;
    });

    const handleDrillWeakQuestions = async () => {
        if (weakQuestions.length === 0) {
            alert(
                "You don't have any weak questions to drill."
            );
            return;
        }

        try {
            const token =
                localStorage.getItem("accessToken");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/sessions`,
                {
                    module: "interview",

                    universityId:
                        report?.universityId ?? null,

                    courseId:
                        report?.courseId ?? null,

                    questionSetId:
                        report?.questionSetId ?? null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const newSessionId =
                response.data?.data?.id;

            if (!newSessionId) {
                console.error(
                    "Session creation response:",
                    response.data
                );

                throw new Error(
                    "Failed to create a new interview session."
                );
            }

            const questionIds = weakQuestions
                .map((question) => question.id)
                .join(",");

            navigate(
                `/dashboard/interview/${newSessionId}?questions=${questionIds}`
            );
        } catch (error) {
            console.error(
                "Failed to create drill session:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to start weak question practice."
            );
        }
    };



    const handleDownload = () => {
        window.print();
    };

  
    const handleBackToDashboard = () => {
        navigate("/dashboard");
    };


    return (
        <div className="mt-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6">

            {/* TITLE */}

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Next Steps
            </h2>

            {/* STEPS */}

            <div className="mt-5 space-y-4">

                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                            {index + 1}
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {step}
                        </p>
                    </div>
                ))}

            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-wrap items-center gap-3 print:hidden">

                {/* DRILL WEAK QUESTIONS */}

                <button
                    type="button"
                    onClick={handleDrillWeakQuestions}
                    className="
                        rounded-xl
                        bg-blue-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        hover:bg-blue-700
                        transition
                    "
                >
                    Drill Weak Questions
                </button>

                {/* DOWNLOAD PDF */}

                <button
                    type="button"
                    onClick={handleDownload}
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-gray-200
                        dark:border-gray-700
                        bg-white
                        dark:bg-gray-900
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-blue-600
                        dark:text-blue-400
                        hover:bg-gray-50
                        dark:hover:bg-gray-800
                        transition
                    "
                >
                    <Download size={16} />
                    Download PDF
                </button>

                {/* BACK TO DASHBOARD */}

                <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className="
                        ml-auto
                        text-sm
                        font-medium
                        text-gray-500
                        dark:text-gray-400
                        hover:text-blue-600
                        dark:hover:text-blue-400
                    "
                >
                    Back to dashboard
                </button>

            </div>

        </div>
    );
}