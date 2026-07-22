import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FinishButton({ disabled = false }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/reports")} // Change this if your report route is different
      disabled={disabled}
      className={`group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-md
        ${
          disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        }`}
    >
      <span>Finish &amp; See Feedback</span>

      <ArrowRight
        size={18}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </button>
  );
}