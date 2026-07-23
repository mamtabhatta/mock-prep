import { Download } from "lucide-react";

export default function NextStepsCard({ steps }) {
  return (
    <div className="mt-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6">

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Your Next Steps
      </h2>


      {/* Steps */}
      <div className="mt-5 space-y-4">

        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
          >

            {/* Number */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {index + 1}
            </div>


            {/* Text */}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {step}
            </p>

          </div>
        ))}

      </div>


      {/* Buttons */}
      <div className="mt-7 flex flex-wrap items-center gap-3">

        {/* Drill Button */}
        <button
          className="
          rounded-xl 
          bg-blue-600 
          px-5 
          py-2.5 
          text-sm 
          font-semibold 
          text-white
          hover:bg-blue-700
          transition
          "
        >
          Drill Weak Questions
        </button>


        {/* Download */}
        <button
          className="
          flex 
          items-center 
          gap-2
          rounded-xl
          border
          border-gray-200
          dark:border-gray-700
          bg-white
          dark:bg-gray-900
          px-5
          py-2.5
          text-sm
          font-semibold
          text-blue-600
          dark:text-blue-400
          hover:bg-gray-50
          dark:hover:bg-gray-800
          transition
          "
        >

          <Download size={16}/>

          Download PDF

        </button>


        {/* Back */}
        <button
          className="
          ml-auto
          text-sm
          font-medium
          text-gray-500
          dark:text-gray-400
          hover:text-blue-600
          dark:hover:text-blue-400
          "
        >
          Back to dashboard
        </button>


      </div>

    </div>
  );
}