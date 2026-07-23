import Bar from "./Bar";

export default function TrendChart() {
  const sessions = [
    { score: 5.5, label: "S1", active: false },
    { score: 6.0, label: "S2", active: false },
    { score: 6.0, label: "S3", active: false },
    { score: 6.5, label: "S4", active: false },
    { score: 6.5, label: "S5", active: true },
  ];

  return (
    <div
      className="
        w-full
        max-w-4xl
        mx-auto
        bg-white
        dark:bg-slate-800
        border border-gray-200
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
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            IELTS Band Trend
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Last 5 sessions
          </p>
        </div>

        <span className="rounded-full bg-blue-50 dark:bg-slate-700 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">
          +1.0
        </span>
      </div>

      {/* Bars */}
      <div className="flex justify-center items-end gap-3 sm:gap-5 h-40 sm:h-48 overflow-x-auto">
        {sessions.map((item) => (
          <Bar
            key={item.label}
            score={item.score}
            label={item.label}
            active={item.active}
          />
        ))}
      </div>
    </div>
  );
}