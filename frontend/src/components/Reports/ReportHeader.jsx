export default function ReportHeader({ report }) {
  return (
    <div className="mb-6">
      {/* Session Status */}
      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
        ✓ Session Complete
      </p>

      {/* Title */}
      <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        Interview Feedback Report
      </h1>

      {/* Subtitle */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>{report.university}</span>

        <span>•</span>

        <span>{report.course}</span>

        <span>•</span>

        <span>{report.date}</span>
      </div>
    </div>
  );
}