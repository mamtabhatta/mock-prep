
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import CueCard from "../../components/Speaking/CueCard";
import FinishButton from "../../components/Speaking/FinishButton";
import RecordingCard from "../../components/Speaking/RecordingCard";
import ProgressBar from "../../components/Speaking/Progressbar";

import api from "../../api/api";

export default function Speaking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("sessionId");

  const [question, setQuestion] = useState(null);
  const [questionId, setQuestionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const TOTAL_QUESTIONS = 3;

  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState("");

  const loadSpeakingQuestion = async () => {
    if (!sessionId) {
      setError("Session ID is missing.");
      setLoadingQuestion(false);
      return false;
    }

    try {
      setLoadingQuestion(true);
      setError("");
      setUploadComplete(false);

      const response = await api.post(
        `/sessions/${sessionId}/speaking-question`
      );

      const data = response.data?.data;

      if (!data?.questionId || !data?.question) {
        throw new Error(
          "Invalid speaking question response."
        );
      }

      setQuestion(data);
      setQuestionId(data.questionId);

      return true;
    } catch (error) {
      console.error(
        "Failed to load speaking question:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load speaking question."
      );

      return false;
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    loadSpeakingQuestion();
  }, [sessionId]);

  const handleUploadComplete = (response) => {
    console.log(
      "Answer uploaded successfully:",
      response
    );

    setUploadComplete(true);
    setError("");
  };

  const handleNextQuestion = async () => {
    if (!sessionId) {
      setError("Session ID is missing.");
      return;
    }

    if (uploading) {
      setError(
        "Please wait for your answer to finish uploading."
      );
      return;
    }

    if (!uploadComplete) {
      setError(
        "Please record and upload your answer before continuing."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const loaded = await loadSpeakingQuestion();

      if (loaded) {
        setCurrentQuestion((previous) =>
          Math.min(
            previous + 1,
            TOTAL_QUESTIONS
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to load next speaking question:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load the next speaking question."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) {
      setError("Session ID is missing.");
      return;
    }

    if (uploading) {
      setError(
        "Please wait for your answer to finish uploading."
      );
      return;
    }

    if (!uploadComplete) {
      setError(
        "Please record and upload your answer before finishing."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(
        `/sessions/${sessionId}/submit`
      );

      console.log(
        "Speaking session submitted:",
        response.data
      );

      navigate(
        `/dashboard/speaking-detail/${sessionId}`
      );
    } catch (error) {
      console.error(
        "Failed to submit speaking session:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to submit speaking session."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-100 px-6 py-10 dark:bg-[#111827]">
        <div className="mx-auto max-w-5xl">
          <p className="text-center font-medium text-red-600">
            Session ID is missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 dark:bg-[#111827]">
      <div className="mx-auto max-w-5xl">
        <ProgressBar
          currentQuestion={currentQuestion}
          totalQuestions={TOTAL_QUESTIONS}
        />

        {loadingQuestion ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-10 text-center shadow-md dark:border-gray-700 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-300">
              Generating your speaking questions...
            </p>
          </div>
        ) : question ? (
          <>
            <div className="mt-6">
              <CueCard
                question={question.question}
                instructions={question.instructions}
              />
            </div>

            <div className="mt-6">
              <RecordingCard
                sessionId={sessionId}
                questionId={questionId}
                onUploadComplete={
                  handleUploadComplete
                }
                onUploadingChange={
                  setUploading
                }
              />
            </div>

            {error && (
              <p className="mt-5 text-center font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="mt-10 flex justify-end">
              {currentQuestion < TOTAL_QUESTIONS ? (
                <FinishButton
                  onClick={handleNextQuestion}
                  disabled={
                    uploading ||
                    !uploadComplete ||
                    submitting
                  }
                  loading={submitting}
                />
              ) : (
                <FinishButton
                  onClick={handleFinish}
                  disabled={
                    uploading ||
                    !uploadComplete ||
                    submitting
                  }
                  loading={submitting}
                />
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-10 text-center shadow-md dark:border-red-900 dark:bg-gray-900">
            <p className="font-medium text-red-600">
              {error ||
                "Unable to generate speaking question."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

