import ReportCard from "../../components/reports/ReportCard";
import { reports } from "../../data/reports";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Reports
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Every session with its score and full feedback.
        </p>

        {/* Cards */}
        <div className="mt-8 space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
            />
          ))}
        </div>
      </div>
    </div>
  );
}