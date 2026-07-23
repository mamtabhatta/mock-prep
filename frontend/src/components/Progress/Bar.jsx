export default function Bar({ score, label, active }) {
  const maxHeight = 170;
  const height = (score / 7) * maxHeight;

  return (
    <div className="flex flex-col items-center w-50">

      {/* Score */}
      <span className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-300">
        {score}
      </span>

      {/* Bar */}
      <div
        style={{ height: `${height}px` }}
        className={`
          w-16 rounded-2xl transition-all duration-300 hover:scale-[1.03]
          ${
            active
              ? "bg-blue-600 shadow-lg shadow-blue-500/20"
              : "bg-blue-50 dark:bg-slate-700"
          }
        `}
      />

      {/* Session */}
      <span className="mt-3 text-sm font-medium text-gray-400 dark:text-gray-500">
        {label}
      </span>

    </div>
  );
}