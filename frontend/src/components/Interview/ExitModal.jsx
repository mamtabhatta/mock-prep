export default function SkipButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition"
    >
      Skip
    </button>
  );
}