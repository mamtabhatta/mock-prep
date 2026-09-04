import { useEffect, useState } from "react";

import api from "../../api/api";

import ReportCard from "../../components/Reports/ReportCard";

export default function Reports() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/sessions");

                console.log(
                    "Reports sessions:",
                    response.data
                );

                setSessions(
                    response.data?.data || []
                );
            } catch (err) {
                console.error(
                    "Failed to fetch reports:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load reports."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const getScore = (session) => {
        const feedbackReport =
            session?.feedbackReport || {};

        const scores =
            feedbackReport?.scoresJson || {};

        const quickSnapshot =
            feedbackReport?.quickSnapshotJson || {};

        const rawScore =
            scores.overall_score ??
            scores.overallScore ??
            scores.overallBand ??
            quickSnapshot.overall_score ??
            quickSnapshot.overallScore ??
            quickSnapshot.overallBand ??
            feedbackReport.overall_score ??
            null;

        if (
            rawScore === null ||
            rawScore === undefined
        ) {
            return "--";
        }

        const numericScore = Number(rawScore);

        if (isNaN(numericScore)) {
            return "--";
        }

        const normalizedScore =
            numericScore > 10
                ? numericScore / 10
                : numericScore;

        return normalizedScore.toFixed(1);
    };

    const getScoreColor = (score) => {
        const numericScore = Number(score);

        if (isNaN(numericScore)) {
            return "blue";
        }

        if (numericScore >= 8) {
            return "green";
        }

        if (numericScore >= 6) {
            return "blue";
        }

        return "orange";
    };

    const formatRelativeDate = (date) => {
        if (!date) {
            return "";
        }

        const targetDate = new Date(date);
        const now = new Date();

        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const startOfTarget = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
        );

        const difference = Math.floor(
            (
                startOfToday -
                startOfTarget
            ) /
            (1000 * 60 * 60 * 24)
        );

        const time =
            targetDate.toLocaleTimeString(
                "en-US",
                {
                    hour: "numeric",
                    minute: "2-digit",
                }
            );

        if (difference === 0) {
            return `Today, ${time}`;
        }

        if (difference === 1) {
            return `Yesterday, ${time}`;
        }

        if (difference === 2) {
            return `2 days ago, ${time}`;
        }

        if (difference < 7) {
            return `${difference} days ago, ${time}`;
        }

        return targetDate.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
            }
        );
    };

    const formatModule = (module) => {
        if (!module) {
            return "University Interview";
        }

        const formatted =
            module
                .replace(/_/g, " ")
                .replace(
                    /\b\w/g,
                    (char) =>
                        char.toUpperCase()
                );

        return formatted;
    };

    const getTitle = (session) => {
        if (
            session.module === "ielts" ||
            session.module === "speaking"
        ) {
            return "IELTS Speaking";
        }

        if (
            session.module ===
            "university_interview"
        ) {
            return "University Interview";
        }

        if (
            session.module ===
            "interview"
        ) {
            return "University Interview";
        }

        return formatModule(
            session.module
        );
    };

    const getUniversity = (session) => {
        return (
            session?.university?.name ||
            session?.universityName ||
            ""
        );
    };

    const getCourse = (session) => {
        return (
            session?.course?.name ||
            session?.courseName ||
            ""
        );
    };

    const reports = sessions
        .filter((session) => {
            const isInterviewOrSpeaking =
                session.module === "interview" ||
                session.module === "university_interview" ||
                session.module === "ielts" ||
                session.module === "speaking";

            const isSubmitted =
                session.status === "submitted" ||
                session.status === "completed" ||
                session.status === "ai_reviewed";

            return (
                isInterviewOrSpeaking &&
                isSubmitted
            );
        })
        .map((session) => {
            const score = getScore(session);

            return {
                id: session.id,

                module: session.module,

                score,

                color:
                    getScoreColor(score),

                title:
                    getTitle(session),

                subtitle:
                    getUniversity(session),

                course:
                    getCourse(session),

                date:
                    formatRelativeDate(
                        session.submittedAt ||
                        session.completedAt ||
                        session.startedAt
                    ),
            };
        });

    if (loading) {
        return (
            <div
                className="
                    min-h-screen
                    bg-gray-50
                    dark:bg-gray-950
                "
            >
                <div
                    className="
                        max-w-4xl
                        mx-auto
                        px-6
                        py-10
                    "
                >
                    <h1
                        className="
                            text-3xl
                            font-bold
                            text-gray-900
                            dark:text-white
                        "
                    >
                        My Reports
                    </h1>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-gray-500
                            dark:text-gray-400
                        "
                    >
                        Loading your reports...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="
                    min-h-screen
                    bg-gray-50
                    dark:bg-gray-950
                "
            >
                <div
                    className="
                        max-w-4xl
                        mx-auto
                        px-6
                        py-10
                    "
                >
                    <h1
                        className="
                            text-3xl
                            font-bold
                            text-gray-900
                            dark:text-white
                        "
                    >
                        My Reports
                    </h1>

                    <div
                        className="
                            mt-8
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-600
                            dark:border-red-900
                            dark:bg-red-950/30
                            dark:text-red-400
                        "
                    >
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="
                min-h-screen
                bg-gray-50
                dark:bg-gray-950
                transition-colors
            "
        >
            <div
                className="
                    max-w-4xl
                    mx-auto
                    px-6
                    py-10
                "
            >
                <h1
                    className="
                        text-3xl
                        font-bold
                        text-gray-900
                        dark:text-white
                    "
                >
                    My Reports
                </h1>

                <p
                    className="
                        mt-2
                        text-sm
                        text-gray-500
                        dark:text-gray-400
                    "
                >
                    Every submitted session with its
                    score and full feedback.
                </p>

                {reports.length === 0 && (
                    <div
                        className="
                            mt-8
                            rounded-2xl
                            border
                            border-gray-200
                            dark:border-gray-800
                            bg-white
                            dark:bg-gray-900
                            p-8
                            text-center
                        "
                    >
                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                                dark:text-white
                            "
                        >
                            No reports yet
                        </h2>

                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-500
                                dark:text-gray-400
                            "
                        >
                            Complete a mock
                            interview or speaking
                            session to see your
                            report here.
                        </p>
                    </div>
                )}

                {reports.length > 0 && (
                    <div
                        className="
                            mt-8
                            space-y-4
                        "
                    >
                        {reports.map(
                            (report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}