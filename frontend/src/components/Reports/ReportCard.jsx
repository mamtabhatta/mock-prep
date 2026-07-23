import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReportCard({ report }) {
  const navigate = useNavigate();

  const badgeColors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  const badge =
    badgeColors[report.color] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        {/* Score */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${badge}`}
        >
          {report.score}
        </div>

        {/* Report Info */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {report.title}
            {report.subtitle && (
              <span className="font-medium">
                {" "}
                · {report.subtitle}
              </span>
            )}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {report.course}
            {report.course && " · "}
            {report.date}
          </p>
        </div>
      </div>

      <button
  onClick={() => navigate(`/reports/${report.id}`)}
  className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
>
  View
  <ArrowRight size={16} />
</button>
    </div>
  );
}