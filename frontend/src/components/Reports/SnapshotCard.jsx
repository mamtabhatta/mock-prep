import { Check, ArrowRight } from "lucide-react";
import OverallScoreCard from "./OverallScoreCard";

export default function SnapshotCard({ report }) {

    const feedbackReport =
        report.feedbackReport || {};

    const scores =
        feedbackReport.scoresJson || {};

    const quickSnapshot =
        feedbackReport.quickSnapshotJson || {};

    const deepReport =
        feedbackReport.deepReportJson || {};

    const aiFeedback =
        feedbackReport.aiFeedbackJson || {};

    const rawScore =
        scores.overall_score ??
        scores.overallScore ??
        feedbackReport.overall_score ??
        null;

    let score = "--";

    if (rawScore !== null && rawScore !== undefined) {
        const numericScore = Number(rawScore);

        if (!isNaN(numericScore)) {
            score =
                numericScore > 10
                    ? numericScore / 10
                    : numericScore;
        }
    }

    const level =
        typeof score === "number"
            ? score >= 8
                ? "Excellent"
                : score >= 6
                    ? "Good"
                    : "Needs Improvement"
            : "Not Available";

    const summary =
        quickSnapshot.summary ||
        deepReport.summary ||
        aiFeedback.summary ||
        "No summary available yet.";

    const strengths =
        Array.isArray(aiFeedback.strengths)
            ? aiFeedback.strengths
            : [];

    const weaknesses =
        Array.isArray(aiFeedback.weaknesses)
            ? aiFeedback.weaknesses
            : [];

    const feedback = [
        ...strengths.map((text) => ({
            type: "good",
            text,
        })),

        ...weaknesses.map((text) => ({
            type: "improve",
            text,
        })),
    ];

    return (
        <div className="bg-white dark:bg-gray-900 mt-[-50px] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">

            <div className="grid md:grid-cols-[170px_1fr]">

                <div className="flex items-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">

                    <OverallScoreCard
                        score={score}
                        level={level}
                    />

                </div>

                <div className="p-6">

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Snapshot
                    </h3>

                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {summary}
                    </p>

                    <div className="mt-5 space-y-3">

                        {feedback.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3"
                            >

                                {item.type === "good" ? (
                                    <Check
                                        size={17}
                                        className="mt-0.5 text-green-500 shrink-0"
                                    />
                                ) : (
                                    <ArrowRight
                                        size={17}
                                        className="mt-0.5 text-orange-500 shrink-0"
                                    />
                                )}

                                <p className="text-sm text-gray-700 dark:text-gray-200">
                                    {item.text}
                                </p>

                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
}