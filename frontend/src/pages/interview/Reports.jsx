
import { useEffect, useState } from "react";

import api from "../../api/api";

import ReportCard from "../../components/Reports/ReportCard";

export default function Reports() {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================
    // FETCH REPORTS
    // ============================================

    useEffect(() => {

        const fetchReports = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await api.get("/sessions");

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

    // ============================================
    // GET SCORE
    // ============================================

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
            quickSnapshot.overall_score ??
            quickSnapshot.overallScore ??
            feedbackReport.overall_score ??
            null;

        if (
            rawScore === null ||
            rawScore === undefined
        ) {
            return "--";
        }

        const numericScore =
            Number(rawScore);

        if (isNaN(numericScore)) {
            return "--";
        }

        // Backend may return 72 or 7.2
        const normalizedScore =
            numericScore > 10
                ? numericScore / 10
                : numericScore;

        return normalizedScore.toFixed(1);
    };

    // ============================================
    // SCORE COLOR
    // ============================================

    const getScoreColor = (score) => {

        const numericScore =
            Number(score);

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

    // ============================================
    // FORMAT RELATIVE DATE
    // ============================================

    const formatRelativeDate = (date) => {

        if (!date) {
            return "";
        }

        const targetDate =
            new Date(date);

        const now =
            new Date();

        const startOfToday =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        const startOfTarget =
            new Date(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate()
            );

        const difference =
            Math.floor(
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

    // ============================================
    // FORMAT MODULE
    // ============================================

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

    // ============================================
    // GET REPORT TITLE
    // ============================================

    const getTitle = (session) => {

        if (session.module === "ielts") {
            return "IELTS Speaking";
        }

        if (session.module === "speaking") {
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

    // ============================================
    // GET UNIVERSITY
    // ============================================

    const getUniversity = (session) => {

        return (
            session?.university?.name ||
            session?.universityName ||
            ""
        );
    };

    // ============================================
    // GET COURSE
    // ============================================

    const getCourse = (session) => {

        return (
            session?.course?.name ||
            session?.courseName ||
            ""
        );
    };

    // ============================================
    // PREPARE REPORT DATA
    // ============================================

    const reports =
        sessions.map((session) => {

            const score =
                getScore(session);

            return {
                id: session.id,

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
                        session.startedAt
                    ),
            };
        });

    // ============================================
    // LOADING
    // ============================================

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

    // ============================================
    // ERROR
    // ============================================

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

    // ============================================
    // PAGE
    // ============================================

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

                {/* ================================= */}
                {/* HEADING */}
                {/* ================================= */}

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
                    Every session with its score
                    and full feedback.
                </p>

                {/* ================================= */}
                {/* EMPTY */}
                {/* ================================= */}

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
                            interview session
                            to see your report
                            here.
                        </p>

                    </div>
                )}

                {/* ================================= */}
                {/* REPORTS */}
                {/* ================================= */}

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

