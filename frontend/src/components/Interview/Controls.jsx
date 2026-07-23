import SkipButton from "./SkipButton";
import SubmitButton from "./SubmitButton";

export default function Controls({
  onSkip,
  onSubmit,
}) {
  return (
    <div className="flex justify-center gap-6 mt-14">

      <SkipButton onClick={onSkip} />

      <SubmitButton onClick={onSubmit} />

    </div>
  );
}