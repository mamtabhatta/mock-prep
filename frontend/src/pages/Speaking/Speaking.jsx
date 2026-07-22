import CueCard from "../../components/Speaking/CueCard";
import FinishButton from "../../components/Speaking/FinishButton";
import RecordingCard from "../../components/Speaking/RecordingCard";
import Timer from "../../components/Speaking/Timer";
import ProgressBar from "../../components/Speaking/Progressbar"

export default function Speaking() {
  const handleFinish = () => {
    console.log("Interview Finished");
  };

  const handleTimeUp = () => {
    console.log("Time Up!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Progress */}
        <ProgressBar
          title="IELTS SPEAKING • PART 2"
          progress={65}
        />

        {/* Cue Card */}
        <div className="mt-6">
          <CueCard />
        </div>

        {/* Recording Section */}
        <div className="mt-6">
          <RecordingCard />
        </div>

       

        {/* Finish Button */}
        <div className="mt-10 flex justify-end">
          <FinishButton
            onClick={handleFinish}
          />
        </div>

      </div>
    </div>
  );
}