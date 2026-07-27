const stats = [
  {
    title: "Total sessions",
    value: "18,402",
    change: "▲ 14% MoM",
    color: "text-green-600",
  },
  {
    title: "Avg. band",
    value: "6.4",
    change: "▲ 0.2",
    color: "text-green-600",
  },
  {
    title: "Completion rate",
    value: "87%",
    change: "Stable",
    color: "text-slate-500",
  },
];

const monthlySessions = [
  { month: "Feb", value: 120 },
  { month: "Mar", value: 140 },
  { month: "Apr", value: 160 },
  { month: "May", value: 180 },
  { month: "Jun", value: 200 },
  { month: "Jul", value: 200 },
];

export default function Analytics() {
  const max = Math.max(...monthlySessions.map((m) => m.value));

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-6 py-6">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Usage over the last 6 months.
        </p>
      </div>

      {/* Cards */}

      <div className="grid gap-4 lg:grid-cols-3">

        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {item.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {item.value}
            </h2>

            <p className={`mt-2 text-xs font-medium ${item.color}`}>
              {item.change}
            </p>
          </div>
        ))}

      </div>

      {/* Chart */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <h2 className="mb-5 text-base font-semibold text-slate-900">
          Sessions per month
        </h2>

        <div className="flex h-44 items-end justify-between gap-3">

          {monthlySessions.map((item) => (
            <div
              key={item.month}
              className="flex flex-1 flex-col items-center"
            >
              <div
                className="w-full rounded-md bg-[#2149D8] transition-all duration-300"
                style={{
                  height: `${(item.value / max) * 140}px`,
                }}
              />

              <p className="mt-2 text-xs text-slate-500">
                {item.month}
              </p>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}