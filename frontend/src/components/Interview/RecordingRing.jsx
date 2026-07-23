export default function RecordingRing({
  secondsLeft,
  totalSeconds = 120,
  isRecording,
  onToggleRecording,
}) {
  const radius = 90;
  const stroke = 10;

  const circumference = 2 * Math.PI * radius;

  const progress = secondsLeft / totalSeconds;

  const offset = circumference * (1 - progress);

  return (
    <button
      onClick={onToggleRecording}
      className="relative w-[220px] h-[220px] cursor-pointer group"
    >
      <svg
        width="220"
        height="220"
        className="-rotate-90"
      >
        {/* Background Ring */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#26344D"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress Ring */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke={isRecording ? "#ef4444" : "#5B84FF"}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>

      {/* Hover Glow */}
      <div
        className={`
          absolute inset-0 rounded-full transition-all duration-300
          ${
            isRecording
              ? "shadow-[0_0_40px_rgba(239,68,68,.35)]"
              : "group-hover:shadow-[0_0_30px_rgba(91,132,255,.25)]"
          }
        `}
      />
    </button>
  );
}