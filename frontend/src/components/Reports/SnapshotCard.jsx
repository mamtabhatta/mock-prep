import { Check, ArrowRight } from "lucide-react";
import OverallScoreCard from "./OverallScoreCard";

export default function SnapshotCard({ report }) {
  return (
    <div className="bg-white dark:bg-gray-900 mt-[-50px] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">

      <div className="grid md:grid-cols-[170px_1fr]">

        {/* Left Score */}
<div className="flex items-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
          <OverallScoreCard
            score={report.score}
            level={report.level}
          />
        </div>


        {/* Right */}
        <div className="p-6">

          {/* Snapshot */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Snapshot
          </h3>

          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {report.snapshot}
          </p>


          {/* Feedback */}
          <div className="mt-5 space-y-3">

            {report.feedback.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
              >

                {item.type === "good" ? (
                  <Check
                    size={17}
                    className="mt-0.5 text-green-500 shrink-0"
                  />
                ) : (
                  <ArrowRight
                    size={17}
                    className="mt-0.5 text-orange-500 shrink-0"
                  />
                )}


                <p
                  className={`text-sm ${
                    item.type === "good"
                      ? "text-gray-700 dark:text-gray-200"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {item.text}
                </p>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}