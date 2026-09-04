import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { ArrowRight } from "lucide-react";

import api from "../../api/api";
import useCamera from "../../hooks/useCamera";

import RecordingRing from "../../components/Interview/RecordingRing";
import TopBar from "../../components/Interview/TopBar";
import CameraPreview from "../../components/Interview/CameraPreview";
import QuestionHeader from "../../components/Interview/QuestionHeader";

export default function Interview() {
  // ============================================================
  // CONSTANTS
  // ============================================================

  const TOTAL_TIME = 120;

  // ============================================================
  // ROUTER
  // ============================================================

  const navigate = useNavigate();
  const { sessionId } = useParams();

  // ============================================================
  // CAMERA
  // ============================================================

  const {
    videoRef,
    loading: cameraLoading,
    permissionDenied,
  } = useCamera();

  // ============================================================
  // QUESTION STATE
  // ============================================================

  const [question, setQuestion] = useState(null);

  const [totalQuestions, setTotalQuestions] =
    useState(5);

  const [currentQuestion, setCurrentQuestion] =
    useState(1);

  const [loadingQuestion, setLoadingQuestion] =
    useState(true);

  const [questionError, setQuestionError] =
    useState("");

  // ============================================================
  // INTERVIEW FORMAT
  // ============================================================

  const [interviewFormat, setInterviewFormat] =
    useState(() => {
      if (!sessionId) {
        return "Panel";
      }

      return (
        sessionStorage.getItem(
          `interviewFormat_${sessionId}`
        ) || "Panel"
      );
    });

  // ============================================================
  // RECORDING STATE
  // ============================================================

  const [secondsLeft, setSecondsLeft] =
    useState(TOTAL_TIME);

  const [isRecording, setIsRecording] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ============================================================
  // MEDIA RECORDER REFS
  // ============================================================

  const mediaRecorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const recordingStartTimeRef =
    useRef(null);

  // ============================================================
  // IMPORTANT LOCKS
  // ============================================================

  // Prevent duplicate next-question API calls.
  const loadingNextQuestionRef =
    useRef(false);

  // Prevent submitAnswer from running twice.
  const submittingAnswerRef =
    useRef(false);

  // Prevent skipQuestion from running twice.
  const skippingQuestionRef =
    useRef(false);

  // Prevent final session submission twice.
  const sessionFinishedRef =
    useRef(false);

  // Prevent initial question from being requested twice.
  const initialQuestionLoadedRef =
    useRef(false);

  // ============================================================
  // CURRENT QUESTION REF
  // ============================================================

  // Always keep the latest question available without
  // depending on React state closures.
  const questionRef =
    useRef(null);

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  // ============================================================
  // FORMAT INFORMATION
  // ============================================================

  const formatLabel = {
    "1-on-1": "1-on-1 Interview",
    Panel: "Panel Interview",
    MMI: "MMI Interview",
  };

  const formatDescription = {
    "1-on-1":
      "One interviewer · One candidate",
    Panel:
      "Multiple interviewers · One candidate",
    MMI:
      "Station-based assessment",
  };

  // ============================================================
  // STOP MICROPHONE STREAM
  // ============================================================

  const cleanupMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  // ============================================================
  // LOAD NEXT QUESTION
  // ============================================================

  const loadNextQuestion = useCallback(
    async () => {
      if (!sessionId) {
        return null;
      }

      // --------------------------------------------------------
      // HARD LOCK
      //
      // This is extremely important because /next-question
      // changes server-side question state.
      // --------------------------------------------------------

      if (loadingNextQuestionRef.current) {
        return null;
      }

      if (sessionFinishedRef.current) {
        return null;
      }

      loadingNextQuestionRef.current =
        true;

      setLoadingQuestion(true);
      setQuestionError("");

      try {
        const response = await api.post(
          `/sessions/${sessionId}/next-question`
        );

        const data =
          response.data?.data;

        if (!data?.questionId) {
          throw new Error(
            "Question was not returned by the server."
          );
        }

        // ------------------------------------------------------
        // Build a complete question object.
        // ------------------------------------------------------

        const nextQuestion = {
          id: data.questionId,
          text: data.question,
          type: data.type,
          orderIndex:
            data.orderIndex || 1,
          totalQuestions:
            data.totalQuestions ||
            totalQuestions ||
            5,
          isLastQuestion:
            Boolean(data.isLastQuestion),
        };

        // ------------------------------------------------------
        // Update ref FIRST.
        //
        // This prevents stale question data from being used
        // while the React state update is happening.
        // ------------------------------------------------------

        questionRef.current =
          nextQuestion;

        setQuestion(
          nextQuestion
        );

        setCurrentQuestion(
          nextQuestion.orderIndex
        );

        setTotalQuestions(
          nextQuestion.totalQuestions
        );

        setSecondsLeft(
          TOTAL_TIME
        );

        return nextQuestion;
      } catch (error) {
        console.error(
          "Failed to load question:",
          error
        );

        setQuestionError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load interview question."
        );

        return null;
      } finally {
        setLoadingQuestion(false);

        loadingNextQuestionRef.current =
          false;
      }
    },
    [
      sessionId,
      totalQuestions,
    ]
  );

  // ============================================================
  // INITIAL QUESTION
  // ============================================================

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    // ----------------------------------------------------------
    // Prevent duplicate initial requests.
    //
    // This protects against React StrictMode and accidental
    // duplicate renders.
    // ----------------------------------------------------------

    if (
      initialQuestionLoadedRef.current
    ) {
      return;
    }

    initialQuestionLoadedRef.current =
      true;

    loadNextQuestion();
  }, [
    sessionId,
    loadNextQuestion,
  ]);

  // ============================================================
  // START RECORDING
  // ============================================================

  const startRecording = async () => {
    // ----------------------------------------------------------
    // Don't start if anything is being submitted.
    // ----------------------------------------------------------

    if (
      isSubmitting ||
      submittingAnswerRef.current ||
      skippingQuestionRef.current ||
      sessionFinishedRef.current
    ) {
      return;
    }

    // ----------------------------------------------------------
    // Don't record without a question.
    // ----------------------------------------------------------

    const activeQuestion =
      questionRef.current;

    if (!activeQuestion?.id) {
      alert(
        "Please wait for the question to load."
      );

      return;
    }

    // ----------------------------------------------------------
    // Don't create multiple recorders.
    // ----------------------------------------------------------

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      return;
    }

    try {
      // --------------------------------------------------------
      // Request microphone.
      //
      // IMPORTANT:
      // We only request microphone when the user explicitly
      // starts recording. This prevents question-generation
      // or question-loading from starting a recording.
      // --------------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }
        );

      streamRef.current =
        stream;

      // --------------------------------------------------------
      // Pick a supported recording format.
      // --------------------------------------------------------

      let mimeType =
        "audio/webm";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType =
          "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        mimeType =
          "audio/webm";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/mp4"
        )
      ) {
        mimeType =
          "audio/mp4";
      }

      // --------------------------------------------------------
      // Create recorder.
      // --------------------------------------------------------

      const mediaRecorder =
        new MediaRecorder(
          stream,
          {
            mimeType,
          }
        );

      mediaRecorderRef.current =
        mediaRecorder;

      // --------------------------------------------------------
      // Clear old chunks.
      //
      // VERY IMPORTANT:
      // Every question gets a completely new recording.
      // --------------------------------------------------------

      chunksRef.current = [];

      // --------------------------------------------------------
      // Collect audio data.
      // --------------------------------------------------------

      mediaRecorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      // --------------------------------------------------------
      // Start recording.
      // --------------------------------------------------------

      recordingStartTimeRef.current =
        Date.now();

      mediaRecorder.start(250);

      setSecondsLeft(
        TOTAL_TIME
      );

      setIsRecording(true);
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      cleanupMicrophone();

      alert(
        "Unable to access your microphone. Please allow microphone permission and try again."
      );
    }
  };

  // ============================================================
  // STOP RECORDING
  // ============================================================

  const stopRecording = useCallback(
    () => {
      return new Promise(
        (resolve) => {
          const mediaRecorder =
            mediaRecorderRef.current;

          // ----------------------------------------------------
          // Nothing recording.
          // ----------------------------------------------------

          if (!mediaRecorder) {
            resolve(null);
            return;
          }

          // ----------------------------------------------------
          // If already inactive, create blob from current
          // chunks.
          // ----------------------------------------------------

          if (
            mediaRecorder.state ===
            "inactive"
          ) {
            const audioBlob =
              new Blob(
                chunksRef.current,
                {
                  type:
                    mediaRecorder.mimeType ||
                    "audio/webm",
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

            cleanupMicrophone();

            chunksRef.current = [];

            recordingStartTimeRef.current =
              null;

            setIsRecording(false);

            resolve({
              audioBlob,
              durationSeconds:
                Math.max(
                  1,
                  elapsedSeconds
                ),
            });

            return;
          }

          // ----------------------------------------------------
          // Handle final recorder stop.
          // ----------------------------------------------------

          const handleStop = () => {
            const finalMimeType =
              mediaRecorder.mimeType ||
              "audio/webm";

            const audioBlob =
              new Blob(
                chunksRef.current,
                {
                  type: finalMimeType,
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

            // --------------------------------------------------
            // Stop microphone immediately.
            // --------------------------------------------------

            cleanupMicrophone();

            chunksRef.current = [];

            recordingStartTimeRef.current =
              null;

            setIsRecording(false);

            resolve({
              audioBlob,
              durationSeconds:
                Math.max(
                  1,
                  elapsedSeconds
                ),
            });
          };

          mediaRecorder.addEventListener(
            "stop",
            handleStop,
            {
              once: true,
            }
          );

          mediaRecorder.stop();
        }
      );
    },
    [cleanupMicrophone]
  );

  // ============================================================
  // TOGGLE RECORDING
  // ============================================================

  const toggleRecording =
    async () => {
      if (
        isSubmitting ||
        sessionFinishedRef.current
      ) {
        return;
      }

      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    };

  // ============================================================
  // UPLOAD ANSWER
  // ============================================================

  const uploadAnswer = async (
    questionId,
    audioBlob,
    durationSeconds
  ) => {
    // ----------------------------------------------------------
    // Never use question state here.
    //
    // The exact questionId is passed explicitly.
    // ----------------------------------------------------------

    if (!questionId) {
      throw new Error(
        "Question ID is missing."
      );
    }

    if (
      !audioBlob ||
      audioBlob.size === 0
    ) {
      throw new Error(
        "The recording is empty."
      );
    }

    const formData =
      new FormData();

    // ----------------------------------------------------------
    // Always use the captured questionId.
    // ----------------------------------------------------------

    formData.append(
      "audio",
      audioBlob,
      `answer-${questionId}.webm`
    );

    formData.append(
      "questionId",
      questionId
    );

    formData.append(
      "durationSeconds",
      String(durationSeconds)
    );

    const response =
      await api.post(
        `/sessions/${sessionId}/answers`,
        formData
      );

    return response.data;
  };

  // ============================================================
  // SUBMIT SESSION
  // ============================================================

  const submitSession =
    async () => {
      if (!sessionId) {
        throw new Error(
          "Session ID is missing."
        );
      }

      const response =
        await api.post(
          `/sessions/${sessionId}/submit`
        );

      return response.data;
    };

  // ============================================================
  // FINISH INTERVIEW
  // ============================================================

  const finishInterview =
    useCallback(async () => {
      // --------------------------------------------------------
      // Don't submit session twice.
      // --------------------------------------------------------

      if (
        sessionFinishedRef.current
      ) {
        return;
      }

      // --------------------------------------------------------
      // Lock immediately.
      // --------------------------------------------------------

      sessionFinishedRef.current =
        true;

      try {
        await submitSession();

        navigate(
          "/dashboard/reports",
          {
            replace: true,
          }
        );
      } catch (error) {
        // ------------------------------------------------------
        // Submission failed.
        //
        // Unlock so the user can retry.
        // ------------------------------------------------------

        sessionFinishedRef.current =
          false;

        throw error;
      }
    }, [
      navigate,
      sessionId,
    ]);

  // ============================================================
  // SUBMIT CURRENT ANSWER
  // ============================================================

  const submitAnswer =
    useCallback(async () => {
      // --------------------------------------------------------
      // HARD LOCK
      // --------------------------------------------------------

      if (
        submittingAnswerRef.current ||
        skippingQuestionRef.current ||
        sessionFinishedRef.current
      ) {
        return;
      }

      // --------------------------------------------------------
      // Must have a question.
      // --------------------------------------------------------

      const activeQuestion =
        questionRef.current;

      if (!activeQuestion) {
        return;
      }

      // --------------------------------------------------------
      // Must currently be recording.
      // --------------------------------------------------------

      if (!isRecording) {
        alert(
          "Please record your answer before submitting."
        );

        return;
      }

      // --------------------------------------------------------
      // LOCK BEFORE stopping recorder.
      //
      // This prevents double-clicks and timer callbacks
      // from submitting the same answer twice.
      // --------------------------------------------------------

      submittingAnswerRef.current =
        true;

      setIsSubmitting(true);

      // --------------------------------------------------------
      // CAPTURE EVERYTHING NOW.
      //
      // Do NOT read question after upload because React state
      // may already have changed.
      // --------------------------------------------------------

      const questionId =
        activeQuestion.id;

      const isLastQuestion =
        Boolean(
          activeQuestion.isLastQuestion
        ) ||
        activeQuestion.orderIndex >=
          totalQuestions;

      try {
        // ------------------------------------------------------
        // Stop recording and wait for final audio data.
        // ------------------------------------------------------

        const recording =
          await stopRecording();

        if (
          !recording?.audioBlob ||
          recording.audioBlob.size === 0
        ) {
          throw new Error(
            "No recording was captured."
          );
        }

        console.log(
          "Uploading answer for question:",
          questionId
        );

        // ------------------------------------------------------
        // Upload MUST finish before moving to next question.
        // ------------------------------------------------------

        await uploadAnswer(
          questionId,
          recording.audioBlob,
          recording.durationSeconds
        );

        console.log(
          "Answer uploaded successfully:",
          questionId
        );

        // ------------------------------------------------------
        // LAST QUESTION
        // ------------------------------------------------------

        if (isLastQuestion) {
          await finishInterview();
          return;
        }

        // ------------------------------------------------------
        // Clear current question only after successful upload.
        // ------------------------------------------------------

        questionRef.current =
          null;

        setQuestion(null);

        setSecondsLeft(
          TOTAL_TIME
        );

        // ------------------------------------------------------
        // NOW request exactly ONE next question.
        // ------------------------------------------------------

        await loadNextQuestion();
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
        submittingAnswerRef.current =
          false;

        setIsSubmitting(false);
      }
    }, [
      isRecording,
      totalQuestions,
      stopRecording,
      finishInterview,
      loadNextQuestion,
    ]);

  // ============================================================
  // SKIP QUESTION
  // ============================================================

  const skipQuestion =
    useCallback(async () => {
      // --------------------------------------------------------
      // HARD LOCK
      // --------------------------------------------------------

      if (
        submittingAnswerRef.current ||
        skippingQuestionRef.current ||
        sessionFinishedRef.current
      ) {
        return;
      }

      const activeQuestion =
        questionRef.current;

      if (!activeQuestion) {
        return;
      }

      skippingQuestionRef.current =
        true;

      setIsSubmitting(true);

      const isLastQuestion =
        Boolean(
          activeQuestion.isLastQuestion
        ) ||
        activeQuestion.orderIndex >=
          totalQuestions;

      try {
        // ------------------------------------------------------
        // Stop recording if user skips while recording.
        // ------------------------------------------------------

        if (isRecording) {
          await stopRecording();
        }

        // ------------------------------------------------------
        // Last question.
        // ------------------------------------------------------

        if (isLastQuestion) {
          await finishInterview();
          return;
        }

        // ------------------------------------------------------
        // Clear current question.
        // ------------------------------------------------------

        questionRef.current =
          null;

        setQuestion(null);

        setSecondsLeft(
          TOTAL_TIME
        );

        // ------------------------------------------------------
        // Load exactly one next question.
        // ------------------------------------------------------

        await loadNextQuestion();
      } catch (error) {
        console.error(
          "Failed to skip question:",
          error
        );

        alert(
          error.response?.data?.message ||
            error.message ||
            "Failed to skip question."
        );
      } finally {
        skippingQuestionRef.current =
          false;

        setIsSubmitting(false);
      }
    }, [
      isRecording,
      totalQuestions,
      stopRecording,
      finishInterview,
      loadNextQuestion,
    ]);

  // ============================================================
  // RECORDING TIMER
  // ============================================================

  useEffect(() => {
    if (
      !isRecording ||
      isSubmitting ||
      sessionFinishedRef.current
    ) {
      return;
    }

    if (secondsLeft <= 0) {
      // --------------------------------------------------------
      // Do not call submit repeatedly.
      // submitAnswer itself has a lock.
      // --------------------------------------------------------

      submitAnswer();

      return;
    }

    const timer =
      setInterval(() => {
        setSecondsLeft(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
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

  // ============================================================
  // PROGRESS
  // ============================================================

  const progress =
    totalQuestions > 0
      ? (currentQuestion /
          totalQuestions) *
        100
      : 0;

  // ============================================================
  // CLEANUP ON UNMOUNT
  // ============================================================

  useEffect(() => {
    return () => {
      cleanupMicrophone();
    };
  }, [cleanupMicrophone]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">

        {/* ================================================== */}
        {/* TOP BAR */}
        {/* ================================================== */}

        <TopBar
          currentQuestion={
            currentQuestion
          }
          totalQuestions={
            totalQuestions
          }
          progress={progress}
        />

        {/* ================================================== */}
        {/* INTERVIEW FORMAT */}
        {/* ================================================== */}

        <div className="mt-5 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
          <span
            className="
              rounded-full
              border
              border-blue-500/30
              bg-blue-500/10
              px-3
              py-1
              text-xs
              font-medium
              text-blue-400
            "
          >
            {formatLabel[interviewFormat] ||
              "Interview"}
          </span>

          <span
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            {formatDescription[
              interviewFormat
            ] || ""}
          </span>
        </div>

        {/* ================================================== */}
        {/* MMI STATION INDICATOR */}
        {/* ================================================== */}

        {interviewFormat === "MMI" && (
          <div className="mt-3 text-center">
            <span className="text-xs font-medium text-slate-400">
              Station {currentQuestion} of{" "}
              {totalQuestions}
            </span>
          </div>
        )}

        {/* ================================================== */}
        {/* QUESTION */}
        {/* ================================================== */}

        <div className="mt-10">
          <QuestionHeader
            question={question}
            loading={
              loadingQuestion
            }
            error={questionError}
          />
        </div>

        {/* ================================================== */}
        {/* CAMERA + RECORDING */}
        {/* ================================================== */}

        <section className="mt-8 flex flex-col items-center justify-center gap-8 lg:flex-row">

          {/* CAMERA */}

          <div className="shrink-0">
            <CameraPreview
              videoRef={videoRef}
              loading={
                cameraLoading
              }
              permissionDenied={
                permissionDenied
              }
            />
          </div>

          {/* RECORDING */}

          <div className="flex min-w-[180px] flex-col items-center justify-center">

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

            <p className="mt-4 text-xs text-slate-500">
              {isSubmitting
                ? "Processing your answer..."
                : isRecording
                ? "Recording your answer..."
                : "Click to start recording"}
            </p>

          </div>
        </section>

        {/* ================================================== */}
        {/* ACTIONS */}
        {/* ================================================== */}

        <section className="mt-10 flex justify-center gap-3">

          {/* SKIP */}

          <button
            type="button"
            onClick={
              skipQuestion
            }
            disabled={
              loadingQuestion ||
              isSubmitting ||
              !question
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Skip
          </button>

          {/* SUBMIT */}

          <button
            type="button"
            onClick={
              submitAnswer
            }
            disabled={
              loadingQuestion ||
              isSubmitting ||
              !question ||
              !isRecording
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : question?.isLastQuestion
              ? "Finish Interview"
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