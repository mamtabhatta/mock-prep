
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import TrendChart from "../../components/Progress/TrendChart";
import StatCard from "../../components/Progress/StatCard";

import api from "../../api/api";

export default function Progress() {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchProgress = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await api.get("/sessions");

                console.log(
                    "Progress sessions:",
                    response.data
                );

                const data =
                    response.data?.data || [];

                setSessions(data);

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
            return null;
        }

        const numericScore =
            Number(rawScore);

        if (isNaN(numericScore)) {
            return null;
        }

        // Backend may return /100 or /10
        return numericScore > 10
            ? numericScore / 10
            : numericScore;
    };

    const scores =
        sessions
            .map(getScore)
            .filter(
                (score) =>
                    typeof score === "number"
            );
    const totalSessions =
        sessions.length;

    const bestScore =
        scores.length > 0
            ? Math.max(...scores)
            : "--";

    const streak = 0;

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
                            sessions={sessions}
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
                            value={totalSessions}
                        />

                        <StatCard
                            title="Best Score"
                            value={
                                bestScore === "--"
                                    ? "--"
                                    : bestScore.toFixed(1)
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

