export default function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      className="
        w-60
        bg-white
        dark:bg-slate-800
        border border-gray-200
        dark:border-slate-700
        rounded-xl
        px-5
        py-4
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
      "
    >
      {/* Title */}
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>

      {/* Value */}
      <div className="flex items-center gap-2 mt-3">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500">
            {icon}
          </div>
        )}

        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
    </div>
  );
}