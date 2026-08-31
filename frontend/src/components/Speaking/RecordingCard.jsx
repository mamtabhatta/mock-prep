
import { useEffect, useRef, useState } from "react";
import MicButton from "./MicButton";
import Timer from "./Timer";
import api from "../../api/api";

export default function RecordingCard({
  sessionId,
  questionId,
  onUploadComplete,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);

  // ============================================
  // STOP MICROPHONE
  // ============================================

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  };

  // ============================================
  // UPLOAD RECORDING
  // ============================================

  const uploadRecording = async (audioBlob, durationSeconds) => {
    if (!sessionId) {
      console.error("Session ID is missing.");
      setUploadError("Session ID is missing.");
      return;
    }

    if (!questionId) {
      console.error("Question ID is missing.");
      setUploadError("Question ID is missing.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();

      formData.append(
        "audio",
        audioBlob,
        "answer.webm"
      );

      formData.append(
        "questionId",
        questionId
      );

      formData.append(
        "durationSeconds",
        String(durationSeconds)
      );

      console.log("Uploading answer...");
      console.log("Session ID:", sessionId);
      console.log("Question ID:", questionId);
      console.log("Duration:", durationSeconds);

      const response = await api.post(
        `/sessions/${sessionId}/answers`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "Answer uploaded successfully:",
        response.data
      );

      if (onUploadComplete) {
        onUploadComplete(response.data);
      }

    } catch (error) {
      console.error(
        "Failed to upload answer:",
        error
      );

      setUploadError(
        error.response?.data?.message ||
          "Failed to upload your answer."
      );
    } finally {
      setUploading(false);
    }
  };

  // ============================================
  // START RECORDING
  // ============================================

  const startRecording = async () => {
    try {
      if (!sessionId) {
        setUploadError("Session ID is missing.");
        console.error("Session ID is missing.");
        return;
      }

      if (!questionId) {
        setUploadError("Question ID is missing.");
        console.error("Question ID is missing.");
        return;
      }

      setUploadError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      chunksRef.current = [];

      startTimeRef.current =
        Date.now();

      // ========================================
      // AUDIO DATA
      // ========================================

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      // ========================================
      // RECORDING STOPPED
      // ========================================

      mediaRecorder.onstop = async () => {
        const audioBlob =
          new Blob(
            chunksRef.current,
            {
              type: "audio/webm",
            }
          );

        setRecordedAudio(audioBlob);

        const durationSeconds =
          startTimeRef.current
            ? Math.round(
                (Date.now() -
                  startTimeRef.current) /
                  1000
              )
            : 0;

        console.log(
          "Recording saved:",
          audioBlob
        );

        console.log(
          "Duration:",
          durationSeconds
        );

        // Make absolutely sure microphone
        // is switched off.
        stopMicrophone();

        // Upload to backend
        await uploadRecording(
          audioBlob,
          durationSeconds
        );
      };

      mediaRecorder.start();

      setIsRecording(true);

      console.log(
        "Recording started"
      );

    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      stopMicrophone();

      alert(
        "Unable to access your microphone."
      );
    }
  };

  // ============================================
  // STOP RECORDING
  // ============================================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    stopMicrophone();
  };

  // ============================================
  // MIC BUTTON
  // ============================================

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

  // ============================================
  // CLEANUP WHEN LEAVING PAGE
  // ============================================

  useEffect(() => {
    return () => {
      console.log(
        "Leaving Speaking page - stopping microphone."
      );

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      stopMicrophone();
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-md py-10 px-6 flex flex-col items-center">

      <MicButton
        isRecording={isRecording}
        onClick={handleMicClick}
      />

      {!isRecording ? (
        <>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Speak for 1–2 minutes
          </h2>

          <p className="mt-2 text-sm text-gray-500 text-center">
            Tap the microphone when you're ready to begin.
          </p>

          {uploading && (
            <p className="mt-4 text-sm text-blue-600 font-medium">
              Uploading your answer...
            </p>
          )}

          {!uploading &&
            recordedAudio && (
              <p className="mt-4 text-sm text-green-600 font-medium">
                Answer uploaded successfully.
              </p>
            )}

          {uploadError && (
            <p className="mt-4 text-sm text-red-600 font-medium text-center">
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
            <Timer
              isRecording={isRecording}
            />
          </div>
        </>
      )}
    </div>
  );
}

