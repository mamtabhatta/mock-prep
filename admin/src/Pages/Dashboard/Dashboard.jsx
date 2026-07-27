export default function Dashboard() {
  const stats = [
    { title: "Universities", value: "42" },
    { title: "Active students", value: "1,284" },
    { title: "Sessions today", value: "318" },
    { title: "Prompt modules", value: "4" },
  ];

  const activities = [
    {
      text: 'Prompt "Interview Feedback" published as v4',
      time: "10 min ago",
    },
    {
      text: "University of Bath added",
      time: "2 hours ago",
    },
    {
      text: "8 questions added to UCL · Medicine",
      time: "Yesterday",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">

      {/* Heading */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500 md:text-base">
          Platform activity at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Recent activity
          </h2>
        </div>

        {activities.map((activity, index) => (
          <div
            key={index}
            className={`flex flex-col gap-2 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
              index !== activities.length - 1
                ? "border-b border-slate-100"
                : ""
            }`}
          >
            <span className="text-slate-600">
              {activity.text}
            </span>

            <span className="text-xs text-slate-400 sm:text-sm">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}