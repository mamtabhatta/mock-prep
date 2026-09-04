import { ArrowRight } from "lucide-react";

export default function FinishButton({
  onClick,
  disabled = false,
  loading = false,
  isLastQuestion = true,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-md transition-all duration-300 ${
        disabled
          ? "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none dark:bg-gray-700 dark:text-gray-500"
          : "bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0"
      }`}
    >
      <span>
        {loading
          ? isLastQuestion
            ? "Submitting..."
            : "Loading..."
          : isLastQuestion
          ? "Finish & See Feedback"
          : "Next Question"}
      </span>

      {!loading && (
        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </button>
  );
}