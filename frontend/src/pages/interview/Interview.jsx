
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import api from "../../api/api";
import useCamera from "../../hooks/useCamera";

import RecordingRing from "../../components/Interview/RecordingRing";
import TopBar from "../../components/Interview/TopBar";
import CameraPreview from "../../components/Interview/CameraPreview";
import QuestionHeader from "../../components/Interview/QuestionHeader";

export default function Interview() {
  const TOTAL_TIME = 120;

  const navigate = useNavigate();
  const { sessionId } = useParams();

  const {
    videoRef,
    loading: cameraLoading,
    permissionDenied,
  } = useCamera();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME);

  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // MEDIA RECORDER
  // ============================================

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const recordingStartTimeRef = useRef(null);

  // ============================================
  // RECEIVE QUESTIONS FROM QUESTION HEADER
  // ============================================

  const handleQuestionsLoaded = useCallback(
    (fetchedQuestions) => {
      setQuestions(fetchedQuestions);
    },
    []
  );

  // ============================================
  // START RECORDING
  // ============================================

  const startRecording = async () => {
    if (isSubmitting) return;

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(
        stream
      );

      mediaRecorderRef.current =
        mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      mediaRecorder.start();

      recordingStartTimeRef.current =
        Date.now();

      setSecondsLeft(TOTAL_TIME);
      setIsRecording(true);

    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      alert(
        "Unable to access your microphone."
      );
    }
  };

  // ============================================
  // STOP RECORDING
  // ============================================

  const stopRecording = () => {
    return new Promise((resolve) => {
      const mediaRecorder =
        mediaRecorderRef.current;

      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      const handleStop = () => {
        const audioBlob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const elapsedSeconds =
          recordingStartTimeRef.current
            ? Math.ceil(
                (Date.now() -
                  recordingStartTimeRef.current) /
                  1000
              )
            : 1;

        // Stop microphone tracks
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        mediaRecorderRef.current = null;
        streamRef.current = null;

        chunksRef.current = [];
        recordingStartTimeRef.current =
          null;

        setIsRecording(false);

        resolve({
          audioBlob,
          durationSeconds: Math.max(
            1,
            elapsedSeconds
          ),
        });
      };

      mediaRecorder.addEventListener(
        "stop",
        handleStop,
        { once: true }
      );

      if (
        mediaRecorder.state !==
        "inactive"
      ) {
        mediaRecorder.stop();
      } else {
        handleStop();
      }
    });
  };

  // ============================================
  // RECORDING BUTTON
  // ============================================

  const toggleRecording = async () => {
    if (isSubmitting) return;

    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // ============================================
  // RESET TIMER
  // ============================================

  const resetTimer = () => {
    setSecondsLeft(TOTAL_TIME);
    setIsRecording(false);
  };

  // ============================================
  // SUBMIT SESSION
  // ============================================

  const submitSession = async () => {
    try {
      const response =
        await api.post(
          `/sessions/${sessionId}/submit`
        );

      console.log(
        "Session submitted:",
        response.data
      );

      return true;

    } catch (error) {
      console.error(
        "Failed to submit session:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to submit the interview."
      );

      return false;
    }
  };

  // ============================================
  // UPLOAD ANSWER
  // ============================================

  const uploadAnswer = async (
    audioBlob,
    durationSeconds
  ) => {
    const question =
      questions[currentQuestion];

    if (!question?.id) {
      throw new Error(
        "Question ID is missing."
      );
    }

    const formData = new FormData();

    formData.append(
      "audio",
      audioBlob,
      `answer-${question.id}.webm`
    );

    formData.append(
      "questionId",
      question.id
    );

    formData.append(
      "durationSeconds",
      String(durationSeconds)
    );

    const response =
      await api.post(
        `/sessions/${sessionId}/answers`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    console.log(
      "Answer uploaded:",
      response.data
    );

    return response.data;
  };

  // ============================================
  // SUBMIT CURRENT ANSWER
  // ============================================

  const submitAnswer = useCallback(
    async () => {
      if (
        isSubmitting ||
        questions.length === 0
      ) {
        return;
      }

      setIsSubmitting(true);

      try {
        let recording = null;

        // If still recording, stop it first
        if (isRecording) {
          recording =
            await stopRecording();
        } else {
          // Recording must exist before answer
          // can be submitted.
          alert(
            "Please record your answer before submitting."
          );

          setIsSubmitting(false);
          return;
        }

        if (
          !recording?.audioBlob ||
          recording.audioBlob.size === 0
        ) {
          throw new Error(
            "No recording was captured."
          );
        }

        // Upload current answer
        await uploadAnswer(
          recording.audioBlob,
          recording.durationSeconds
        );

        // ========================================
        // LAST QUESTION
        // ========================================

        const isLastQuestion =
          currentQuestion ===
          questions.length - 1;

        if (isLastQuestion) {
          // Change session status:
          // in_progress → submitted
          const submitted =
            await submitSession();

          if (submitted) {
            navigate(
              "/dashboard/reports"
            );
          }

          return;
        }

        // ========================================
        // NEXT QUESTION
        // ========================================

        setCurrentQuestion(
          (prev) => prev + 1
        );

        setSecondsLeft(TOTAL_TIME);

      } catch (error) {
        console.error(
          "Failed to submit answer:",
          error
        );

        alert(
          error.response?.data?.message ||
            error.message ||
            "Failed to submit your answer."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentQuestion,
      questions,
      isRecording,
      isSubmitting,
      sessionId,
      navigate,
    ]
  );

  // ============================================
  // TIMER
  // ============================================

  useEffect(() => {
    if (
      !isRecording ||
      isSubmitting
    ) {
      return;
    }

    if (secondsLeft <= 0) {
      submitAnswer();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(
        (prev) => prev - 1
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    isRecording,
    isSubmitting,
    secondsLeft,
    submitAnswer,
  ]);

  // ============================================
  // SKIP QUESTION
  // ============================================

  const skipQuestion = async () => {
    if (
      isSubmitting ||
      questions.length === 0
    ) {
      return;
    }

    // Stop recording if currently recording
    if (isRecording) {
      await stopRecording();
    }

    const isLastQuestion =
      currentQuestion ===
      questions.length - 1;

    if (isLastQuestion) {
      const submitted =
        await submitSession();

      if (submitted) {
        navigate(
          "/dashboard/reports"
        );
      }

      return;
    }

    setCurrentQuestion(
      (prev) => prev + 1
    );

    resetTimer();
  };

  // ============================================
  // PROGRESS
  // ============================================

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) /
          questions.length) *
        100
      : 0;

  // ============================================
  // CLEANUP
  // ============================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">

        {/* ========================================
            TOP BAR
        ======================================== */}

        <TopBar
          currentQuestion={
            questions.length > 0
              ? currentQuestion + 1
              : 0
          }
          totalQuestions={
            questions.length
          }
          progress={progress}
        />

        {/* ========================================
            QUESTION HEADER
        ======================================== */}

        <div className="mt-10">

          <QuestionHeader
            sessionId={sessionId}
            currentQuestion={
              currentQuestion
            }
            onQuestionsLoaded={
              handleQuestionsLoaded
            }
          />

        </div>

        {/* ========================================
            CAMERA + RECORDING
        ======================================== */}

        <section className="
          mt-8
          flex
          flex-col
          items-center
          justify-center
          gap-8
          lg:flex-row
        ">

          {/* CAMERA */}

          <div className="shrink-0">

            <CameraPreview
              videoRef={videoRef}
              loading={cameraLoading}
              permissionDenied={
                permissionDenied
              }
            />

          </div>

          {/* RECORDING */}

          <div className="
            flex
            min-w-[180px]
            flex-col
            items-center
            justify-center
          ">

            <RecordingRing
              secondsLeft={
                secondsLeft
              }
              totalSeconds={
                TOTAL_TIME
              }
              isRecording={
                isRecording
              }
              onToggleRecording={
                toggleRecording
              }
            />

            <p className="
              mt-4
              text-xs
              text-slate-500
            ">
              {isSubmitting
                ? "Submitting your answer..."
                : isRecording
                ? "Recording your answer..."
                : "Click to start recording"}
            </p>

          </div>

        </section>

        {/* ========================================
            ACTION BUTTONS
        ======================================== */}

        <section className="
          mt-10
          flex
          justify-center
          gap-3
        ">

          {/* SKIP */}

          <button
            type="button"
            onClick={skipQuestion}
            disabled={
              questions.length === 0 ||
              isSubmitting
            }
            className="
              rounded-lg
              border
              border-slate-700
              bg-slate-900
              px-5
              py-2.5
              text-sm
              font-medium
              text-slate-300
              transition
              hover:border-slate-600
              hover:bg-slate-800
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Skip
          </button>

          {/* SUBMIT */}

          <button
            type="button"
            onClick={submitAnswer}
            disabled={
              questions.length === 0 ||
              isSubmitting ||
              !isRecording
            }
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting
              ? "Submitting..."
              : "Submit Answer"}

            {!isSubmitting && (
              <ArrowRight
                size={16}
                strokeWidth={2}
              />
            )}

          </button>

        </section>

      </div>

    </div>
  );
}

