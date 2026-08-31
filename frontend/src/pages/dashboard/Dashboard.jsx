import { useEffect, useState } from "react";
import {
  Flame,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ============================================
  // FETCH SESSIONS
  // ============================================

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/sessions");

        console.log("Sessions response:", response.data);

        const sessionData = response.data?.data || [];

        setSessions(sessionData);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);

        console.error(
          "Backend response:",
          err.response?.data
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your sessions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  // ============================================
  // USER NAME
  // ============================================

  const userName =
    user?.fullName ||
    user?.name ||
    "Student";

  // ============================================
  // SESSION STATISTICS
  // ============================================

  const totalSessions = sessions.length;

  const completedSessions = sessions.filter(
    (session) =>
      session.status === "submitted" ||
      session.status === "scored" ||
      session.status === "ai_reviewed"
  ).length;

  const interviewSessions = sessions.filter(
    (session) =>
      session.module === "interview"
  ).length;

  const speakingSessions = sessions.filter(
    (session) =>
      session.module === "ielts" ||
      session.module === "speaking"
  ).length;

  // ============================================
  // FORMAT MODULE
  // ============================================

  const getModuleName = (module) => {
    if (!module) return "Practice";

    if (module === "interview") {
      return "University Interview";
    }

    if (
      module === "ielts" ||
      module === "speaking"
    ) {
      return "IELTS Speaking";
    }

    return module;
  };

  // ============================================
  // FORMAT STATUS
  // ============================================

  const getStatusText = (status) => {
    if (!status) return "In progress";

    switch (status) {
      case "in_progress":
        return "In progress";

      case "submitted":
        return "Submitted";

      case "scored":
        return "Scored";

      case "ai_reviewed":
        return "AI reviewed";

      default:
        return status.replaceAll("_", " ");
    }
  };

  // ============================================
  // STATUS STYLE
  // ============================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "scored":
      case "ai_reviewed":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";

      case "submitted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";

      case "in_progress":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date) => {
    if (!date) return "";

    const sessionDate = new Date(date);

    if (Number.isNaN(sessionDate.getTime())) {
      return "";
    }

    return sessionDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ============================================
  // RECENT SESSIONS
  // ============================================

  const recentSessions = [...sessions]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || b.startedAt
        ) -
        new Date(
          a.createdAt || a.startedAt
        )
    )
    .slice(0, 3);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 p-6 lg:p-8 ml-4 transition-colors duration-300">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Namaste, {userName} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Welcome back to your MockPrep dashboard.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-900/30 px-4 py-3 font-semibold text-orange-600 dark:text-orange-300">
          <Flame size={18} />

          {totalSessions > 0
            ? `${totalSessions} ${
                totalSessions === 1
                  ? "session"
                  : "sessions"
              }`
            : "Start practicing"}
        </div>

      </div>


      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}


      {/* ========================================
          STATS
      ======================================== */}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Sessions */}

        <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">
            Total Sessions
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {totalSessions}
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-gray-400">
            All practice sessions
          </p>

        </div>


        {/* Completed */}

        <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">
            Completed
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {completedSessions}
          </h2>

          <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
            Submitted sessions
          </p>

        </div>


        {/* Interviews */}

        <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">
            Interviews
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {interviewSessions}
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-gray-400">
            University interview practice
          </p>

        </div>


        {/* IELTS */}

        <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">
            IELTS Speaking
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {speakingSessions}
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-gray-400">
            Speaking practice sessions
          </p>

        </div>

      </div>


      {/* ========================================
          START PRACTICE
      ======================================== */}

      <h2 className="mt-8 mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
        Start Practice
      </h2>


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* University Interview */}

        <div className="rounded-xl bg-blue-600 p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

          <h2 className="text-lg font-semibold">
            University Interview
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-100">
            Practice university interview questions
            tailored to your application with AI-powered
            feedback.
          </p>

          <button
            onClick={() =>
              navigate(
                "/dashboard/practice"
              )
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Start Interview

            <ArrowRight size={16} />
          </button>

        </div>


        {/* IELTS */}

        <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            IELTS Speaking
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
            Practice IELTS speaking tasks with cue cards,
            timers, recordings and AI-powered feedback.
          </p>

          <button
            onClick={() =>
              navigate(
                "/dashboard/speaking"
              )
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-gray-700"
          >
            Start Practice

            <ArrowRight size={16} />
          </button>

        </div>

      </div>


      {/* ========================================
          RECENT SESSIONS
      ======================================== */}

      <div className="mt-10 flex items-center justify-between">

        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
          Recent Sessions
        </h2>

        <button
          onClick={() =>
            navigate(
              "/dashboard/reports"
            )
          }
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All

          <ArrowRight size={15} />
        </button>

      </div>


      {/* ========================================
          SESSION CARDS
      ======================================== */}

      {recentSessions.length === 0 ? (

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">

          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No sessions yet
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Start your first practice session to see
            your progress here.
          </p>

          <button
            onClick={() =>
              navigate(
                "/dashboard/practice"
              )
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start Practice

            <ArrowRight size={16} />
          </button>

        </div>

      ) : (

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {recentSessions.map(
            (session) => (

              <div
                key={session.id}
                className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex items-start justify-between gap-3">

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {getModuleName(
                      session.module
                    )}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                      session.status
                    )}`}
                  >
                    {getStatusText(
                      session.status
                    )}
                  </span>

                </div>


                <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">
                  {formatDate(
                    session.createdAt ||
                      session.startedAt
                  )}
                </p>


                {session.universityId && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                    University selected
                  </p>
                )}


                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/reports/${session.id}`
                    )
                  }
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400"
                >
                  View Session

                  <ArrowRight size={15} />
                </button>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}