export default function OverallScoreCard({ score, level }) {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-5">

      {/* Score */}
      <div className="flex items-end">
        <span className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          {score}
        </span>
      </div>


      {/* Level Badge */}

  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
    {level}
  </span>
</div>


  );
}