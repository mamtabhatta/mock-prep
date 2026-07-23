export default function QuestionHeader({
  type,
  university,
  question,
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-14">

      <p className="uppercase tracking-[5px] text-blue-400 font-semibold text-sm">

        {type} • {university}

      </p>

      <h1 className="mt-5 text-5xl font-bold leading-tight text-white">

        {question}

      </h1>

    </div>
  );
}