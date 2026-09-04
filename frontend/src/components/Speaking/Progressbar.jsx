import { useNavigate } from "react-router-dom";

export default function ProgressBar({
  currentQuestion = 1,
  totalQuestions = 3,
}) {
  const navigate = useNavigate();

  const progress =
    totalQuestions > 0
      ? (currentQuestion / totalQuestions) * 100
      : 0;

  return (
    <div className="mb-8 w-full">
      {/* Top Row */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
          IELTS SPEAKING • PART 2 • QUESTION{" "}
          {currentQuestion} OF {totalQuestions}
        </h2>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Exit ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}