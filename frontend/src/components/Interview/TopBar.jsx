import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopBar({
  currentQuestion,
  totalQuestions,
  progress,
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full mt-0">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2">

            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>

            <span className="font-semibold text-white">
              REC
            </span>

          </div>

          <span className="text-gray-400">
            Question {currentQuestion} of {totalQuestions}
          </span>

        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 border border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          Exit
          <X size={18} />
        </button>

      </div>

      <div className="w-full h-0.5 bg-gray-800 rounded-full mt-1 overflow-hidden">

        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

      </div>

    </div>
  );
}