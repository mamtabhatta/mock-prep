export default function ReportHeader({ report }) {

    const university =
        report.university?.name ||
        report.universityName ||
        "University";

    const course =
        report.course?.name ||
        report.courseName ||
        "Interview";

    const date = report.submittedAt || report.startedAt;

    const formattedDate = date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "";

    return (
        <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                ✓ Session Complete
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                Interview Feedback Report
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{university}</span>
                <span>•</span>
                <span>{course}</span>
                <span>•</span>
                <span>{formattedDate}</span>
            </div>

        </div>
    );
}