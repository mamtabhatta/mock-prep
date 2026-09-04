import { useEffect, useRef, useState } from "react";
import MicButton from "./MicButton";
import Timer from "./Timer";
import api from "../../api/api";

export default function RecordingCard({
  sessionId,
  questionId,
  onUploadComplete,
  onUploadingChange,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const uploadRecording = async (audioBlob, durationSeconds) => {
    if (!sessionId) {
      setUploadError("Session ID is missing.");
      return;
    }

    if (!questionId) {
      setUploadError("Question ID is missing.");
      return;
    }

    try {
      setUploading(true);
      onUploadingChange?.(true);
      setUploadError("");

      const formData = new FormData();

      formData.append("audio", audioBlob, "answer.webm");
      formData.append("questionId", questionId);
      formData.append("durationSeconds", String(durationSeconds));

      console.log("Uploading speaking answer...");
      console.log("Session ID:", sessionId);
      console.log("Question ID:", questionId);
      console.log("Duration:", durationSeconds);

      const response = await api.post(
        `/sessions/${sessionId}/answers`,
        formData
      );

      console.log("Answer uploaded successfully:", response.data);

      setRecordedAudio(audioBlob);
      onUploadComplete?.(response.data);
    } catch (error) {
      console.error("Failed to upload answer:", error);

      setUploadError(
        error.response?.data?.message ||
          "Failed to upload your answer."
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!sessionId) {
        setUploadError("Session ID is missing.");
        return;
      }

      if (!questionId) {
        setUploadError("Question ID is missing.");
        return;
      }

      setUploadError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        const durationSeconds = startTimeRef.current
          ? Math.max(
              1,
              Math.round(
                (Date.now() - startTimeRef.current) / 1000
              )
            )
          : 1;

        stopMicrophone();

        console.log("Recording completed:", audioBlob);
        console.log("Duration:", durationSeconds);

        await uploadRecording(audioBlob, durationSeconds);
      };

      mediaRecorder.start();
      setIsRecording(true);

      console.log("Recording started.");
    } catch (error) {
      console.error("Microphone error:", error);

      stopMicrophone();
      setUploadError("Unable to access your microphone.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    stopMicrophone();
  };

  const handleMicClick = () => {
    if (uploading) {
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      stopMicrophone();
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-10 shadow-md">
      <MicButton
        isRecording={isRecording}
        onClick={handleMicClick}
      />

      {!isRecording ? (
        <>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Speak for 1–2 minutes
          </h2>

          <p className="mt-2 text-center text-sm text-gray-500">
            Tap the microphone when you're ready to begin.
          </p>

          {uploading && (
            <p className="mt-4 font-medium text-blue-600">
              Uploading your answer...
            </p>
          )}

          {!uploading && recordedAudio && (
            <p className="mt-4 font-medium text-green-600">
              Answer uploaded successfully.
            </p>
          )}

          {uploadError && (
            <p className="mt-4 text-center text-sm font-medium text-red-600">
              {uploadError}
            </p>
          )}
        </>
      ) : (
        <>
          <h2 className="mt-6 text-xl font-semibold text-red-600">
            Recording...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your response is being recorded.
          </p>

          <div className="mt-5">
            <Timer isRecording={isRecording} />
          </div>
        </>
      )}
    </div>
  );
}