import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCamera from "../../hooks/useCamera";
import { X, ArrowRight } from "lucide-react";
import { questions } from "../../data/questions";
import RecordingRing from "../../components/Interview/RecordingRing";
import TopBar from "../../components/Interview/TopBar";
import CameraPreview from "../../components/Interview/CameraPreview";

export default function Interview() {
  const TOTAL_TIME = 120;
  const navigate = useNavigate();
  const {
    videoRef,
    stream,
    loading,
    permissionDenied,
  } = useCamera();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME);

  const [isRecording, setIsRecording] = useState(false);



  useEffect(() => {
    if (!isRecording) return;

    if (secondsLeft === 0) {
      submitAnswer();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording, secondsLeft]);



  const progress =
    ((currentQuestion + 1) / questions.length) * 100;


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remain = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remain
    ).padStart(2, "0")}`;
  };


  function toggleRecording() {
    setIsRecording((prev) => !prev);
  }


  function resetTimer() {
    setSecondsLeft(TOTAL_TIME);
    setIsRecording(false);
  }


  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      resetTimer();
    } else {
      setIsRecording(false);
      navigate("/reports");
    }
  }


  function skipQuestion() {
    nextQuestion();
  }



  function submitAnswer() {
    nextQuestion();
  }



  return (
    <div className="min-h-screen bg-[#0B1220] text-white">

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ---------- Top Bar ---------- */}
        <TopBar
          currentQuestion={currentQuestion + 1}
          totalQuestions={questions.length}
          progress={progress}
        />

        {/* ---------- Question ---------- */}

        <div className="mt-7 text-center max-w-1xl mx-auto">

          <p className="uppercase tracking-[1px] text-blue-400 font-semibold">

            {questions[currentQuestion].type}

            {" • "}

            {questions[currentQuestion].university}

          </p>

          <h1 className="text-3xl font-bold mt-6 leading-tight">

            {questions[currentQuestion].question}

          </h1>

        </div>
        {/* ---------- Main Content ---------- */}

        <div className="mt-7 flex items-center justify-center gap-8">

          <CameraPreview
            videoRef={videoRef}
            loading={loading}
            permissionDenied={permissionDenied}
          />

          <div className="flex flex-col items-center">
            <RecordingRing
              secondsLeft={secondsLeft}
              totalSeconds={TOTAL_TIME}
              isRecording={isRecording}
              onToggleRecording={toggleRecording}
            />


          </div>

        </div>

        {/* ---------- Bottom Buttons ---------- */}

        <div className="mt-20 flex justify-center gap-6">

          <button
            onClick={skipQuestion}
            className="
              px-8
              py-3
              rounded-xl
              border
              border-gray-700
              hover:bg-gray-800
              transition-all
            "
          >
            Skip
          </button>

          <button
            onClick={submitAnswer}
            className="
              flex
              items-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              px-8
              py-3
              rounded-xl
              transition-all
            "
          >
            Submit Answer

            <ArrowRight size={18} />

          </button>

        </div>

      </div>
    </div>
  );
}