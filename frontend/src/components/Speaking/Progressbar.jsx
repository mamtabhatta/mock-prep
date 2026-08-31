import { useNavigate } from "react-router-dom";

export default function ProgressBar() {
  const navigate = useNavigate();

  return (
    <div className="w-full mb-8">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
          IELTS SPEAKING • Part 2
        </h2>

        <button
          onClick={() => navigate("/")} 
          className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Exit ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: "65%" }}
        ></div>
      </div>
    </div>
  );
}