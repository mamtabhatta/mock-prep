import { useEffect, useState } from "react";

export default function Timer({
  isRecording = false,
  initialTime,
}) {
  const [seconds, setSeconds] = useState(initialTime ?? 0);

  useEffect(() => {
    let interval;

    if (typeof initialTime === "number") {
      // Countdown
      setSeconds(initialTime);

      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isRecording) {
      // Count up
      setSeconds(0);

      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording, initialTime]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <h2 className="text-lg font-semibold text-gray-900">
      Prep time: {String(minutes).padStart(2, "0")}:
      {String(remainingSeconds).padStart(2, "0")}
    </h2>
  );
}