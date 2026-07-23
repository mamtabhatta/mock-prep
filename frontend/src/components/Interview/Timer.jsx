export default function Timer({ seconds }) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return (
    <span className="text-4xl font-bold">
      {String(minutes).padStart(2, "0")}:
      {String(remaining).padStart(2, "0")}
    </span>
  );
}