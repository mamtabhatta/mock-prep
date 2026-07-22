import Timer from "./Timer";

export default function CueCard() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold tracking-wide text-orange-600">
          CUE CARD
        </span>

        <Timer initialTime={48} />
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-900 leading-snug mb-4">
        Describe a person who has influenced you.
      </h2>

      {/* Instructions */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        You should say:
      </p>

      <ul className="space-y-2 list-disc pl-5 text-sm text-gray-700 leading-6">
        <li>who this person is</li>
        <li>how you know them</li>
        <li>what they did</li>
        <li>and explain why they influenced you</li>
      </ul>
    </div>
  );
}