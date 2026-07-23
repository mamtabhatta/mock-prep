import {
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      title: "IELTS band",
      value: "6.5",
      subtitle: "▲ up 0.5",
      color: "text-green-600",
    },
    {
      title: "Interview score",
      value: "7.2/10",
      subtitle: "Competent",
      color: "text-gray-500",
    },
    {
      title: "Sessions",
      value: "12",
      subtitle: "this month",
      color: "text-gray-500",
    },
    {
      title: "Streak",
      value: "5 days",
      subtitle: "🔥 keep going",
      color: "text-orange-500",
    },
  ];

  const sessions = [
    {
      title: "Univ. of Leeds",
      type: "Interview · Today",
      score: "7.2",
      scoreColor: "bg-green-100 text-green-600",
    },
    {
      title: "IELTS Speaking",
      type: "Full test · Yesterday",
      score: "6.5",
      scoreColor: "bg-green-100 text-green-600",
    },
    {
      title: "Univ. of Manchester",
      type: "Interview · 2 days ago",
      score: "6.0",
      scoreColor: "bg-orange-100 text-orange-500",
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen p-6 lg:p-8 ml-4 transition-colors duration-300">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div>
         <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Namaste, Aashish 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Preparing for{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-200">
              MSc Data Science
            </span>{" "}
            · University of Leeds
          </p>
        </div>

        <div className="bg-orange-200 text-orange-500 px-3 py-3 rounded-full font-semibold flex items-center gap-2">
          <Flame size={18} />
          5 day streak
        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-4 mt-8">
  {stats.map((item) => (
    <div
      key={item.title}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {item.title}
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        {item.value}
      </h2>

      <p className={`mt-1 text-xs font-medium ${item.color}`}>
        {item.subtitle}
      </p>
    </div>
  ))}
</div>

      {/* Start Practice */}

   <h2 className="mt-8 mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
  Start Practice
</h2>

<div className="grid grid-cols-2 gap-4">

  {/* University Interview */}
  <div className="rounded-xl bg-blue-600 p-5 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <h2 className="text-lg font-semibold">
      University Interview
    </h2>

    <p className="mt-2 text-sm leading-6 text-blue-100">
      Panel questions tailored to your course and application with instant AI feedback.
    </p>

    <button
      onClick={() => navigate("/practice")}
      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
    >
      Start Interview
      <ArrowRight size={16} />
    </button>
  </div>

  {/* IELTS Speaking */}
  <div className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    <h2 className="text-lg font-semibold text-slate-900">
      IELTS Speaking
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Practice all speaking tasks with cue cards, timers, and AI-powered band score feedback.
    </p>

    <button
      onClick={() => navigate("/speaking")}
      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      Start Practice
      <ArrowRight size={16} />
    </button>
  </div>

</div>

      {/* Recent Sessions */}
<div className="flex items-center justify-between mt-10">
  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
    Recent Sessions
  </h2>

  <button className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700">
    View All
    <ArrowRight size={15} />
  </button>
</div>

<div className="grid grid-cols-3 gap-4 mt-4">
  {sessions.map((session) => (
    <div
      key={session.title}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {session.title}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${session.scoreColor}`}
        >
          {session.score}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {session.type}
      </p>

      <button
        onClick={() => navigate("/reports")}
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        View Report
        <ArrowRight size={15} />
      </button>
    </div>
  ))}
</div>

    </div>
  );
}