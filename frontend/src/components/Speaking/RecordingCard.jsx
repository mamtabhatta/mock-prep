import { useRef, useState } from "react";
import MicButton from "./MicButton";
import Timer from "./Timer";

export default function RecordingCard() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        // Save recording for later upload
        setRecordedAudio(audioBlob);

        console.log("Recording saved:", audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      alert("Unable to access your microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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

          {recordedAudio && (
            <p className="mt-4 text-sm text-green-600 font-medium">
             
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
            <Timer isRecording={isRecording} />
          </div>
        </>
      )}
    </div>
  );
}