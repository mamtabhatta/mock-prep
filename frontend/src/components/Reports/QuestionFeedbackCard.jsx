import ScoreBar from "./ScoreBar";

export default function QuestionFeedbackCard({ question }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">

      {/* Question */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {question.title}
      </h2>


      {/* Answer */}
      <div className="mt-3">
        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
          "{question.answer.before}{" "}
          <span className="rounded bg-yellow-200 dark:bg-yellow-500/30 px-1 py-0.5 text-yellow-900 dark:text-yellow-300">
            {question.answer.highlight}
          </span>{" "}
          {question.answer.after}"
        </p>
      </div>


      {/* Scores */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        <ScoreBar
          title="Structure"
          score={question.structure}
          color="green"
        />

        <ScoreBar
          title="Content"
          score={question.content}
          color="orange"
        />

        <ScoreBar
          title="Language"
          score={question.language}
          color="blue"
        />

        <ScoreBar
          title="Confidence"
          score={question.confidence}
          color="green"
        />

      </div>

    </div>
  );
} 