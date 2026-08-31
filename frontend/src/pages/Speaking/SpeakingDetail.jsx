import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

import api from "../../api/api";
import RecordingCard from "../../components/Speaking/RecordingCard";

export default function SpeakingDetail() {
    const navigate = useNavigate();

    const [sessionId, setSessionId] = useState(null);
    const [questionId, setQuestionId] = useState(null);
    const [questionText, setQuestionText] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================
    // CREATE SPEAKING SESSION
    // ============================================

    useEffect(() => {
        const createSpeakingSession = async () => {
            try {
                setLoading(true);
                setError("");

                // Create a speaking session
                const sessionResponse = await api.post(
                    "/sessions",
                    {
                        module: "speaking",
                    }
                );

                const createdSession =
                    sessionResponse.data?.data;

                if (!createdSession?.id) {
                    throw new Error(
                        "Session ID was not returned by the server."
                    );
                }

                const newSessionId =
                    createdSession.id;

                setSessionId(newSessionId);

                console.log(
                    "Speaking session created:",
                    newSessionId
                );

                // ========================================
                // FETCH QUESTIONS
                // ========================================

                const questionsResponse =
                    await api.get(
                        `/sessions/${newSessionId}/questions`
                    );

                const questions =
                    questionsResponse.data?.data || [];

                if (questions.length === 0) {
                    throw new Error(
                        "No speaking questions were found."
                    );
                }

                const firstQuestion =
                    questions[0];

                if (!firstQuestion?.id) {
                    throw new Error(
                        "Question ID is missing."
                    );
                }

                setQuestionId(
                    firstQuestion.id
                );

                setQuestionText(
                    firstQuestion.text || ""
                );

                console.log(
                    "Speaking question:",
                    firstQuestion
                );

            } catch (error) {
                console.error(
                    "Failed to create speaking session:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        error.message ||
                        "Failed to start speaking practice."
                );
            } finally {
                setLoading(false);
            }
        };

        createSpeakingSession();
    }, []);

    // ============================================
    // UPLOAD COMPLETE
    // ============================================

    const handleUploadComplete = (
        response
    ) => {
        console.log(
            "Speaking answer uploaded:",
            response
        );
    };

    // ============================================
    // LOADING
    // ============================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">

                <div className="flex flex-col items-center">

                    <Loader2
                        size={32}
                        className="animate-spin text-blue-600"
                    />

                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        Preparing your speaking practice...
                    </p>

                </div>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8 dark:bg-slate-950">

                <div className="mx-auto max-w-3xl">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/speaking"
                            )
                        }
                        className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <ArrowLeft size={16} />

                        Back to Speaking Practice
                    </button>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">

                        <h2 className="font-semibold text-red-700 dark:text-red-400">
                            Unable to start speaking practice
                        </h2>

                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>

                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // UI
    // ============================================

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8 transition-colors duration-300 dark:bg-slate-950">

            <div className="mx-auto max-w-4xl">

                {/* Back */}
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/dashboard/speaking"
                        )
                    }
                    className="mb-8 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <ArrowLeft size={16} />

                    Back
                </button>

                {/* Header */}
                <div className="mb-8">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Speaking Practice
                    </p>

                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        Give your response
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Speak naturally and try to answer clearly
                        and confidently.
                    </p>

                </div>

                {/* Question */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Speaking Prompt
                    </p>

                    <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-900 dark:text-white">
                        {questionText ||
                            "Please answer the speaking prompt."}
                    </h2>

                </div>

                {/* Recording */}
                {sessionId && questionId && (
                    <RecordingCard
                        sessionId={sessionId}
                        questionId={questionId}
                        onUploadComplete={
                            handleUploadComplete
                        }
                    />
                )}

            </div>
        </div>
    );
}