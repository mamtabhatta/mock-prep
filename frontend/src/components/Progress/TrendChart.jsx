import Bar from "./Bar";

export default function TrendChart({ sessions = [] }) {
    const getScore = (session) => {
        const feedbackReport =
            session?.feedbackReport || {};

        const scores =
            feedbackReport?.scoresJson || {};

        const quickSnapshot =
            feedbackReport?.quickSnapshotJson || {};

        const rawScore =
            session?.module === "speaking"
                ? (
                    scores.overallBand ??
                    scores.overall_band ??
                    quickSnapshot.overallBand ??
                    quickSnapshot.overall_band ??
                    null
                )
                : (
                    scores.overallScore ??
                    scores.overall_score ??
                    quickSnapshot.overallScore ??
                    quickSnapshot.overall_score ??
                    null
                );

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

        return session?.module === "interview" &&
            numericScore > 10
            ? numericScore / 10
            : numericScore;
    };

    const scoredSessions =
        sessions
            .filter(
                (session) =>
                    session?.feedbackReport &&
                    getScore(session) !== null
            )
            .slice(-5)
            .map((session) => ({
                ...session,
                score: getScore(session),
            }));

    const validScores =
        scoredSessions
            .map((session) => session.score)
            .filter(
                (score) =>
                    typeof score === "number"
            );

    let trend = 0;

    if (validScores.length >= 2) {
        trend =
            validScores[
                validScores.length - 1
            ] -
            validScores[0];
    }

    const trendText =
        trend > 0
            ? `+${trend.toFixed(1)}`
            : trend < 0
                ? trend.toFixed(1)
                : "0.0";

    return (
        <div
            className="
                w-full
                max-w-4xl
                mx-auto
                bg-white
                dark:bg-slate-800
                border
                border-gray-200
                dark:border-slate-700
                rounded-2xl
                shadow-sm
                px-5
                sm:px-6
                py-5
                transition-all
                duration-300
                hover:shadow-md
            "
        >
            <div
                className="
                    flex
                    items-center
                    justify-between
                    mb-5
                "
            >
                <div>
                    <h2
                        className="
                            text-base
                            sm:text-lg
                            font-semibold
                            text-gray-900
                            dark:text-white
                        "
                    >
                        IELTS Band Trend
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            sm:text-sm
                            text-gray-500
                            dark:text-gray-400
                        "
                    >
                        Last {Math.min(
                            scoredSessions.length,
                            5
                        )} sessions
                    </p>
                </div>

                <span
                    className="
                        rounded-full
                        bg-blue-50
                        dark:bg-slate-700
                        px-2.5
                        py-1
                        text-[10px]
                        sm:text-xs
                        font-medium
                        text-blue-600
                        dark:text-blue-400
                    "
                >
                    {trendText}
                </span>
            </div>

            {scoredSessions.length === 0 && (
                <div
                    className="
                        h-40
                        sm:h-48
                        flex
                        items-center
                        justify-center
                        text-sm
                        text-gray-400
                        dark:text-gray-500
                    "
                >
                    No completed sessions yet.
                </div>
            )}

            {scoredSessions.length > 0 && (
                <div
                    className="
                        flex
                        justify-center
                        items-end
                        gap-3
                        sm:gap-5
                        min-h-40
                        sm:min-h-48
                        overflow-x-auto
                        pb-2
                    "
                >
                    {scoredSessions.map(
                        (session, index) => (
                            <Bar
                                key={session.id}
                                score={session.score}
                                label={`S${index + 1}`}
                                active={
                                    index ===
                                    scoredSessions.length - 1
                                }
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}