import { useEffect, useRef, useState } from "react";

export default function useCamera() {
  const videoRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let currentStream;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setPermissionDenied(true);
        setLoading(false);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function stopCamera() {
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  return {
    videoRef,
    stream,
    loading,
    permissionDenied,
    stopCamera,
  };
}