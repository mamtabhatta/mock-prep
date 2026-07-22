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
    <div className="bg-slate-50 min-h-screen p-6 lg:p-8 ml-4">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Namaste, Aashish 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Preparing for{" "}
            <span className="font-semibold text-gray-800">
              MSc Data Science
            </span>{" "}
            · University of Leeds
          </p>
        </div>

        <div className="bg-orange-200 text-orange-600 px-3 py-3 rounded-full font-semibold flex items-center gap-2">
          <Flame size={18} />
          5 day streak
        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-6 mt-10">

        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-gray-500 text-sm">
              {item.title}
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {item.value}
            </h2>

            <p className={`mt-2 text-sm font-medium ${item.color}`}>
              {item.subtitle}
            </p>
          </div>
        ))}

      </div>

      {/* Start Practice */}

      <h2 className="mt-7 mb-5 text-gray-500 font-bold uppercase tracking-wide">
        Start Practice
      </h2>

      <div className="grid grid-cols-2 gap-3">

        {/* Left */}

        <div className="bg-blue-700 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">
            University Interview
          </h2>

          <p className="mt-2 text-blue-100 text-sm leading-6">
            Panel questions tailored to your course & documents, with instant feedback.
          </p>

          <button
            onClick={() => navigate("/practice")}
            className="mt-4 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            Start interview
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right */}

        <div className="bg-white rounded-xl gap-5 border border-gray-200 p-5">
          <h2 className="text-xl  font-bold">
            IELTS Speaking
          </h2>

          <p className="mt-2 text-gray-500 text-sm leading-6">
            Full speaking test with cue cards, timing, and a band-score estimate.
          </p>

          <button className="mt-4 bg-gray-100 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-200">
            Start practice
            <ArrowRight size={18} />
          </button>
        </div>

      </div>

      {/* Recent Sessions */}

      <div className="flex justify-between items-center mt-12">

        <h2 className="uppercase text-gray-500 font-bold">
          Recent Sessions
        </h2>

        <button className="text-blue-600 font-400 flex items-center gap-1">
          View all
          <ArrowRight size={16} />
        </button>

      </div>

      <div className="grid grid-cols-3 gap-6 mt-5">

        {sessions.map((session) => (
          <div
            key={session.title}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex justify-between">

              <h3 className="font-bold text-600">
                {session.title}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${session.scoreColor}`}
              >
                {session.score}
              </span>

            </div>

            <p className="text-gray-500 mt-5">
              {session.type}
            </p>

            <button
              onClick={() => navigate("/reports")}
              className="mt-5 text-blue-600 font-semibold flex items-center gap-1"
            >
              View report
              <ArrowRight size={16} />
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}