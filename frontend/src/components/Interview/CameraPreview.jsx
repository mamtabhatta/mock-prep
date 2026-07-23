import { CameraOff } from "lucide-react";

export default function CameraPreview({
  videoRef,
  loading,
  permissionDenied,
}) {
  if (loading) {
    return (
      <div className="w-72 h-44 rounded-2xl bg-[#182235] border border-gray-700 flex items-center justify-center text-gray-400">
        Starting Camera...
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="w-72 h-44 rounded-2xl bg-[#182235] border border-red-600 flex flex-col items-center justify-center gap-3">
        <CameraOff size={36} className="text-red-500" />

        <p className="text-gray-300 text-sm">
          Camera permission denied.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-100 h-60 rounded-2xl overflow-hidden border border-gray-700 bg-black ">

      {/* Live Badge */}
      <div className="absolute top-3 mt-20 left-3 z-10 bg-black/70 rounded-full px-3 py-1 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>

        <span className="text-xs text-white">
          LIVE
        </span>
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full  object-cover scale-x-[-1]"
      />

    </div>
  );
}