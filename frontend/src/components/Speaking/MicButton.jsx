import { Mic } from "lucide-react";

export default function MicButton({
  isRecording = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 focus:outline-none focus:ring-4
        ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-200 shadow-red-200 shadow-lg"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:ring-blue-200 shadow-blue-100 shadow-lg"
        }`}
    >
      {/* Outer Ring */}
      <span
        className={`absolute inset-0 rounded-full border-2 ${
          isRecording
            ? "border-red-300 animate-ping"
            : "border-blue-200"
        }`}
      ></span>

      {/* Mic Icon */}
      <Mic
        className="relative z-10 w-8 h-8 text-white"
        strokeWidth={2.5}
      />
    </button>
  );
}