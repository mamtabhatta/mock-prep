export default function ScoreBar({ title, score }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {title}
        </span>

        <span className="font-semibold text-gray-900 dark:text-white">
          {score}/10
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}