import ScoreBar from "./ScoreBar";

export default function QuestionFeedbackCard({ session }) {

    const questions = session.questions || [];
    const answers = session.answers || [];

    const aiFeedback =
        session.feedbackReport?.aiFeedbackJson || {};

    const answerFeedback =
        Array.isArray(aiFeedback.answer_feedback)
            ? aiFeedback.answer_feedback
            : [];

    const getTranscript = (answer) => {
        return (
            answer?.transcription ||
            answer?.transcript ||
            answer?.answer ||
            answer?.text ||
            "No transcript available."
        );
    };

    const getScore = (feedback) => {

        const rawScore =
            feedback?.score ??
            feedback?.overall_score ??
            feedback?.overallScore ??
            0;

        const score = Number(rawScore);

        if (isNaN(score)) {
            return 0;
        }

        return score > 10
            ? score / 10
            : score;
    };

    return (
        <div className="mt-6 space-y-6">

            {questions.map((question) => {

                const answer = answers.find(
                    (item) =>
                        String(item.questionId) ===
                        String(question.id)
                );

                const feedback = answerFeedback.find(
                    (item) =>
                        String(item.question_id) ===
                        String(question.id)
                );

                if (!answer && !feedback) {
                    return null;
                }

                const score = getScore(feedback);

                return (
                    <div
                        key={question.id}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6"
                    >

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {question.text || "Question"}
                        </h2>

                        <div className="mt-3">
                            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                                "{getTranscript(answer)}"
                            </p>
                        </div>

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                            <ScoreBar
                                title="Structure"
                                score={score}
                            />

                            <ScoreBar
                                title="Content"
                                score={score}
                            />

                            <ScoreBar
                                title="Language"
                                score={score}
                            />

                            <ScoreBar
                                title="Confidence"
                                score={score}
                            />

                        </div>

                    </div>
                );
            })}

        </div>
    );
}