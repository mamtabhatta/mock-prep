import TrendChart from "../../components/Progress/TrendChart";
import StatCard from "../../components/Progress/StatCard";
import { Flame } from "lucide-react";

export default function Progress() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] transition-colors duration-300">
      <div className="max-w-6xl px-8 py-10">
        <div className="max-w-3xl ml-8">

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Progress
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You're trending upward — keep the streak alive.
          </p>

          {/* Trend Chart */}
          <div className="mt-8">
            <TrendChart />
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <StatCard
              title="Sessions"
              value="12"
            />

            <StatCard
              title="Best Band"
              value="6.5"
            />

            <StatCard
              title="Streak"
              value="5"
              icon={
                <Flame
                  size={16}
                  className="text-orange-500 fill-orange-500"
                />
              }
            />
          </div>

        </div>
      </div>
    </div>
  );
}