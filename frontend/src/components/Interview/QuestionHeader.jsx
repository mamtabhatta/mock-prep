export default function QuestionHeader({
  question,
  loading,
  error,
}) {
  
  if (loading) {
    return (
      <div className="mx-auto mb-8 max-w-2xl text-center">

        <div className="flex flex-col items-center">

          <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />

          <div className="mt-4 h-6 w-full max-w-xl animate-pulse rounded bg-slate-800" />

          <div className="mt-2 h-6 w-4/5 max-w-lg animate-pulse rounded bg-slate-800" />

        </div>

        <p className="mt-4 text-xs text-slate-500">
          Generating your personalized question...
        </p>

      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="mx-auto mb-8 max-w-2xl text-center">

        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">

          <p className="text-xs font-medium text-red-400">
            {error}
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // NO QUESTION
  // ============================================================

  if (!question) {
    return (
      <div className="mx-auto mb-8 max-w-2xl text-center">

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">

          <p className="text-xs text-slate-400">
            Question not available.
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // QUESTION TYPE
  // ============================================================

  const formattedType =
    String(
      question.type ||
        question.typeTag ||
        "motivational"
    )
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  const questionNumber =
    question.orderIndex || 1;

  const totalQuestions =
    question.totalQuestions || 5;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">

      <p className="text-xs font-semibold uppercase tracking-[3px] text-blue-400">
        {formattedType}
      </p>

      <p className="mt-2 text-[11px] font-medium text-slate-500">
        Question {questionNumber} of{" "}
        {totalQuestions}
      </p>

      <h1 className="mt-3 text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
        {question.text}
      </h1>

    </div>
  );
}