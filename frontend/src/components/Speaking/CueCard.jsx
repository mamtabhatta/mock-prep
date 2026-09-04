import Timer from "./Timer";

export default function CueCard({
  question,
  instructions = [],
}) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold tracking-wide text-orange-600">
          CUE CARD
        </span>
        <Timer initialTime={48} />
      </div>

      <h2 className="mb-4 text-xl font-semibold leading-snug text-gray-900">
        {question}
      </h2>

      <p className="mb-2 text-sm font-medium text-gray-500">
        You should say:
      </p>

      <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>
    </div>
  );
}