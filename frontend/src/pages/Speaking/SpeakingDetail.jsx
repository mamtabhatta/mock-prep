
import { useEffect, useState } from "react";
import {
  Check,
  ArrowRight,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function SpeakingDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH REPORT
  // ============================================================

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const fetchReport = async () => {
      if (!sessionId) {
        if (!cancelled) {
          setError("Session ID is missing.");
          setLoading(false);
        }

        return;
      }

      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          if (!cancelled) {
            setError("You are not authenticated.");
            setLoading(false);
          }

          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cancelled) return;

        const data = response.data?.data;

        if (!data) {
          throw new Error(
            "Invalid session response."
          );
        }

        const feedback = data.feedbackReport;

        // ========================================================
        // REPORT NOT READY
        // ========================================================

        if (!feedback) {
          console.log(
            "Speaking report is not ready yet.",
            {
              sessionId,
              sessionStatus: data.status,
            }
          );

          setProcessing(true);
          setLoading(false);

          setError("");

          return false;
        }

        // ========================================================
        // REPORT READY
        // ========================================================

        console.log(
          "Speaking report is ready."
        );

        setProcessing(false);
        setError("");

        const scores =
          feedback.scoresJson || {};

        const snapshot =
          feedback.quickSnapshotJson || {};

        const deepReport =
          feedback.deepReportJson || {};

        const overallBand = Number(
          scores.overallBand ??
            snapshot.overallBand ??
            0
        );

        const previousBand = Number(
          snapshot.previousBand ??
            snapshot.previousOverallBand ??
            scores.previousBand ??
            0
        );

        const improvement =
          previousBand > 0
            ? Number(
                (
                  overallBand -
                  previousBand
                ).toFixed(1)
              )
            : 0;

        setReport({
          title:
            "IELTS Speaking Report",

          subtitle: `Full test · ${new Date(
            feedback.createdAt ||
              data.updatedAt ||
              Date.now()
          ).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}`,

          overallBand,

          previousBand,

          improvement,

          breakdown: [
            {
              label:
                "Fluency & Coherence",

              score: Number(
                scores.fluencyCoherence ??
                  scores.fluency_and_coherence ??
                  0
              ),

              color:
                "bg-blue-600",
            },

            {
              label:
                "Lexical Resource",

              score: Number(
                scores.lexicalResource ??
                  scores.lexical_resource ??
                  0
              ),

              color:
                "bg-emerald-600",
            },

            {
              label:
                "Grammatical Range",

              score: Number(
                scores.grammaticalRange ??
                  scores.grammatical_range ??
                  0
              ),

              color:
                "bg-blue-600",
            },

            {
              label:
                "Pronunciation",

              score: Number(
                scores.pronunciation ??
                  0
              ),

              color:
                "bg-blue-600",
            },
          ],

          speakingPace: Number(
            snapshot.speakingPace ??
              snapshot.speaking_pace ??
              0
          ),

          fillerWords: Number(
            snapshot.fillerWords ??
              snapshot.filler_words ??
              0
          ),

          fillerWordExamples:
            Array.isArray(
              snapshot.fillerWordExamples
            )
              ? snapshot.fillerWordExamples
              : Array.isArray(
                  snapshot.filler_word_examples
                )
              ? snapshot.filler_word_examples
              : Array.isArray(
                  snapshot.detectedFillers
                )
              ? snapshot.detectedFillers
              : ["um", "like"],

          speakingTime:
            snapshot.speakingTime ??
            snapshot.speaking_time ??
            "0:00",

          strengths:
            Array.isArray(
              deepReport.strengths
            )
              ? deepReport.strengths
              : [],

          improvements:
            Array.isArray(
              deepReport.improvements
            )
              ? deepReport.improvements
              : [],

          examinerNote:
            deepReport.examinerNote ??
            deepReport.examiner_note ??
            "Keep practicing consistently and focus on improving your weaker areas.",
        });

        setLoading(false);

        // ========================================================
        // STOP POLLING
        // ========================================================

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        return true;
      } catch (err) {
        if (cancelled) return false;

        console.error(
          "Failed to load speaking report:",
          err
        );

        // ========================================================
        // IMPORTANT
        //
        // Don't immediately show a permanent error while the
        // backend is still processing the report.
        // ========================================================

        if (
          err.response?.status === 404
        ) {
          setError(
            "Speaking session not found."
          );

          setProcessing(false);
          setLoading(false);

          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          return false;
        }

        setError(
          err.response?.data?.message ||
            "Failed to load speaking report."
        );

        setProcessing(false);
        setLoading(false);

        return false;
      }
    };

    // ============================================================
    // INITIAL FETCH
    // ============================================================

    fetchReport();

    // ============================================================
    // POLL EVERY 2 SECONDS
    //
    // The first request happens immediately above.
    // Additional requests happen every 2 seconds.
    // ============================================================

    intervalId = setInterval(() => {
      fetchReport();
    }, 2000);

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sessionId]);

  // ============================================================
  // PRACTICE AGAIN
  // ============================================================

  const handlePracticeAgain = async () => {
    try {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await axios.post(
          `${import.meta.env.VITE_API_URL}/sessions`,
          {
            module: "speaking",
            universityId: null,
            courseId: null,
            questionSetId: null,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const newSessionId =
        response.data?.data?.id;

      if (!newSessionId) {
        console.error(
          "Session creation response:",
          response.data
        );

        throw new Error(
          "Failed to create a new speaking session."
        );
      }

      navigate(
        `/dashboard/speaking?sessionId=${newSessionId}`
      );
    } catch (error) {
      console.error(
        "Failed to create speaking session:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to start a new speaking practice."
      );
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-slate-700 dark:bg-[#111827] dark:text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-700 dark:border-slate-600 dark:border-t-blue-400" />

          <p className="text-sm">
            Loading your speaking report...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PROCESSING SCREEN
  // ============================================================

  if (
    processing &&
    !report
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 text-slate-700 dark:bg-[#111827] dark:text-slate-200">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700 dark:border-blue-900 dark:border-t-blue-400" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Generating your report
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your speaking answer is being
            transcribed and analyzed. Your
            IELTS feedback will appear
            automatically when it is ready.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            Processing...
          </div>

          <button
            onClick={() =>
              navigate(
                "/dashboard/speaking"
              )
            }
            className="mt-7 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to speaking
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 text-slate-700 dark:bg-[#111827] dark:text-slate-200">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Report unavailable
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {error ||
              "Your speaking report is not available yet."}
          </p>

          <button
            onClick={() =>
              navigate(
                "/dashboard/speaking"
              )
            }
            className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Back to speaking
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // SCORE PROGRESS
  // ============================================================

  const progress = Math.min(
    Math.max(
      (report.overallBand / 9) *
        326.7,
      0
    ),
    326.7
  );

  // ============================================================
  // REPORT UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-8 text-slate-800 transition-colors duration-300 dark:bg-[#111827] dark:text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1 text-xs font-semibold tracking-wider text-emerald-700 dark:text-emerald-400">
            <Check
              size={15}
              strokeWidth={3}
            />

            FEEDBACK READY
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
            {report.title}
          </h1>

          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            {report.subtitle}
          </p>
        </div>

        {/* Overall + Breakdown */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">

          {/* Overall Score */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col items-center">

              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg
                  className="absolute h-full w-full -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-200 dark:text-slate-700"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="326.7"
                    strokeDashoffset={
                      326.7 - progress
                    }
                    className="text-blue-700"
                  />
                </svg>

                <div className="relative text-center">
                  <div className="text-4xl font-bold text-slate-800 dark:text-white">
                    {report.overallBand.toFixed(
                      1
                    )}
                  </div>

                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    / 9.0 band
                  </div>
                </div>
              </div>

              <h3 className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
                Overall Band Estimate
              </h3>

              {report.previousBand > 0 ? (
                <div
                  className={`mt-1 flex items-center gap-1 text-sm font-medium ${
                    report.improvement > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : report.improvement <
                        0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <TrendingUp
                    size={15}
                  />

                  {report.improvement >
                  0
                    ? `up ${report.improvement.toFixed(
                        1
                      )} from last test`
                    : report.improvement <
                      0
                    ? `down ${Math.abs(
                        report.improvement
                      ).toFixed(
                        1
                      )} from last test`
                    : "no change from last test"}
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <TrendingUp
                    size={15}
                  />

                  AI estimated score
                </div>
              )}
            </div>
          </div>

          {/* Band Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-white">
              Band breakdown
            </h2>

            <div className="space-y-4">
              {report.breakdown.map(
                (item) => (
                  <div
                    key={item.label}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>

                      <span className="font-semibold text-slate-800 dark:text-white">
                        {item.score.toFixed(
                          1
                        )}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{
                          width: `${Math.min(
                            (item.score /
                              9) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Speaking Statistics */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Speaking Pace */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Speaking pace
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">
                {report.speakingPace}
              </span>

              <span className="font-medium text-slate-500">
                wpm
              </span>
            </div>
          </div>

          {/* Filler Words */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Filler words
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">
                {report.fillerWords}
              </span>

              <span className="font-medium text-slate-500">
                {report.fillerWordExamples
                  .slice(0, 3)
                  .map(
                    (word) =>
                      `"${word}"`
                  )
                  .join(", ")}
              </span>
            </div>
          </div>

          {/* Speaking Time */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Speaking time
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">
                {report.speakingTime}
              </span>

              <span className="font-medium text-slate-500">
                total
              </span>
            </div>
          </div>
        </div>

        {/* Strengths + Improvements */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Strengths */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-5 font-bold text-emerald-700 dark:text-emerald-400">
              What went well
            </h2>

            <div className="space-y-4">
              {report.strengths
                .length > 0 ? (
                report.strengths.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex gap-3"
                    >
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {item}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No strengths were
                  returned.
                </p>
              )}
            </div>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-5 font-bold text-amber-700 dark:text-amber-400">
              Areas to improve
            </h2>

            <div className="space-y-4">
              {report.improvements
                .length > 0 ? (
                report.improvements.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex gap-3"
                    >
                      <ArrowRight
                        size={18}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {item}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No improvement
                  suggestions
                  were
                  returned.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Examiner Note */}
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare
              size={16}
              className="text-emerald-700 dark:text-emerald-400"
            />

            <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
              Examiner Note
            </h3>
          </div>

          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            {report.examinerNote}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">

          <button
            onClick={
              handlePracticeAgain
            }
            className="rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
          >
            Practice again
          </button>

          <button
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to dashboard
          </button>

        </div>
      </div>
    </div>
  );
}

