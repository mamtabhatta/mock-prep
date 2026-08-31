
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CueCard from "../../components/Speaking/CueCard";
import FinishButton from "../../components/Speaking/FinishButton";
import RecordingCard from "../../components/Speaking/RecordingCard";
import ProgressBar from "../../components/Speaking/Progressbar";

import api from "../../api/api";

export default function Speaking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [uploading, setUploading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [uploadComplete, setUploadComplete] =
    useState(false);

  const [error, setError] =
    useState("");

  const sessionId =
    searchParams.get("sessionId");

  const questionId =
    searchParams.get("questionId");

  const handleUploadComplete = (
    response
  ) => {
    console.log(
      "Answer uploaded successfully:",
      response
    );

    setUploadComplete(true);
    setError("");
  };
    


  const handleFinish = async () => {
    if (!sessionId) {
      setError("Session ID is missing.");
        navigate("/dashboard/speaking-detail");
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

      console.log(
        "Submitting session:",
        sessionId
      );

      const response = await api.post(
        `/sessions/${sessionId}/submit`
      );

      console.log(
        "Session submitted:",
        response.data
      );

      /*
       * Do NOT expect AI feedback to exist yet.
       *
       * The backend submits the session and
       * BullMQ handles transcription + AI review
       * asynchronously.
       */

      navigate(
        `/speaking-detail?sessionId=${sessionId}`
      );
    } catch (error) {
      console.error(
        "Failed to submit session:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to submit the interview."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 dark:bg-[#111827]">
      <div className="mx-auto max-w-5xl">

        <ProgressBar
          title="IELTS SPEAKING • PART 2"
          progress={65}
        />

        <div className="mt-6">
          <CueCard />
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
          <FinishButton
            onClick={handleFinish}
            disabled={
              uploading ||
              !uploadComplete
            }
            loading={submitting}
          />
        </div>
      </div>
    </div>
  );
}

