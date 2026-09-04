import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import TrendChart from "../../components/Progress/TrendChart";
import StatCard from "../../components/Progress/StatCard";

import api from "../../api/api";

export default function Progress() {
    const [sessions, setSessions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchProgress =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await api.get(
                            "/sessions"
                        );

                    const data =
                        response.data?.data ||
                        [];

                    const sortedSessions =
                        Array.isArray(data)
                            ? [...data].sort(
                                (a, b) =>
                                    new Date(
                                        a.createdAt
                                    ) -
                                    new Date(
                                        b.createdAt
                                    )
                            )
                            : [];

                    setSessions(
                        sortedSessions
                    );
                } catch (err) {
                    console.error(
                        "Failed to load progress:",
                        err
                    );

                    setError(
                        err.response?.data?.message ||
                        "Failed to load progress."
                    );
                } finally {
                    setLoading(false);
                }
            };

        fetchProgress();
    }, []);

    const getScore = (session) => {
        const feedbackReport =
            session?.feedbackReport || {};

        if (!feedbackReport) {
            return null;
        }

        const scores =
            feedbackReport?.scoresJson || {};

        const quickSnapshot =
            feedbackReport?.quickSnapshotJson ||
            {};

        let rawScore = null;

        if (
            session?.module ===
            "speaking"
        ) {
            rawScore =
                scores.overallBand ??
                scores.overall_band ??
                quickSnapshot.overallBand ??
                quickSnapshot.overall_band ??
                null;
        }

        if (
            session?.module ===
            "interview"
        ) {
            rawScore =
                scores.overallScore ??
                scores.overall_score ??
                quickSnapshot.overallScore ??
                quickSnapshot.overall_score ??
                null;
        }

        if (
            rawScore === null ||
            rawScore === undefined
        ) {
            return null;
        }

        const numericScore =
            Number(rawScore);

        if (isNaN(numericScore)) {
            return null;
        }

        if (
            session?.module ===
                "interview" &&
            numericScore > 10
        ) {
            return numericScore / 10;
        }

        return numericScore;
    };

    const completedSessions =
        sessions.filter(
            (session) =>
                session?.feedbackReport &&
                getScore(session) !== null
        );

    const scores =
        completedSessions
            .map(getScore)
            .filter(
                (score) =>
                    typeof score ===
                    "number"
            );

    const totalSessions =
        completedSessions.length;

    const bestScore =
        scores.length > 0
            ? Math.max(...scores)
            : "--";

    const calculateStreak = () => {
        if (
            completedSessions.length === 0
        ) {
            return 0;
        }

        const uniqueDates = [
            ...new Set(
                completedSessions.map(
                    (session) =>
                        new Date(
                            session.createdAt
                        )
                            .toISOString()
                            .split("T")[0]
                )
            ),
        ].sort(
            (a, b) =>
                new Date(b) -
                new Date(a)
        );

        let streak = 1;

        for (
            let i = 0;
            i <
            uniqueDates.length - 1;
            i++
        ) {
            const current =
                new Date(
                    uniqueDates[i]
                );

            const previous =
                new Date(
                    uniqueDates[i + 1]
                );

            const difference =
                Math.round(
                    (
                        current -
                        previous
                    ) /
                    (1000 * 60 * 60 * 24)
                );

            if (
                difference === 1
            ) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const streak =
        calculateStreak();

    if (loading) {
        return (
            <div
                className="
                    min-h-screen
                    bg-gray-50
                    dark:bg-[#111827]
                    transition-colors
                    duration-300
                "
            >
                <div
                    className="
                        max-w-6xl
                        px-8
                        py-10
                    "
                >
                    <div className="max-w-3xl ml-8">
                        <h1
                            className="
                                text-3xl
                                font-bold
                                text-gray-900
                                dark:text-white
                            "
                        >
                            Your Progress
                        </h1>

                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-500
                                dark:text-gray-400
                            "
                        >
                            Loading your progress...
                        </p>
                    </div>
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
                    dark:bg-[#111827]
                    transition-colors
                    duration-300
                "
            >
                <div
                    className="
                        max-w-6xl
                        px-8
                        py-10
                    "
                >
                    <div className="max-w-3xl ml-8">
                        <h1
                            className="
                                text-3xl
                                font-bold
                                text-gray-900
                                dark:text-white
                            "
                        >
                            Your Progress
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
            </div>
        );
    }

    return (
        <div
            className="
                min-h-screen
                bg-gray-50
                dark:bg-[#111827]
                transition-colors
                duration-300
            "
        >
            <div
                className="
                    max-w-6xl
                    px-8
                    py-10
                "
            >
                <div className="max-w-3xl ml-8">
                    <h1
                        className="
                            text-3xl
                            font-bold
                            text-gray-900
                            dark:text-white
                        "
                    >
                        Your Progress
                    </h1>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-gray-500
                            dark:text-gray-400
                        "
                    >
                        Track your interview
                        performance and keep
                        improving.
                    </p>

                    <div className="mt-8">
                        <TrendChart
                            sessions={
                                completedSessions
                            }
                        />
                    </div>

                    <div
                        className="
                            mt-6
                            grid
                            grid-cols-3
                            gap-4
                        "
                    >
                        <StatCard
                            title="Sessions"
                            value={
                                totalSessions
                            }
                        />

                        <StatCard
                            title="Best Score"
                            value={
                                bestScore === "--"
                                    ? "--"
                                    : bestScore.toFixed(
                                        1
                                    )
                            }
                        />

                        <StatCard
                            title="Streak"
                            value={streak}
                            icon={
                                <Flame
                                    size={16}
                                    className="
                                        text-orange-500
                                        fill-orange-500
                                    "
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}