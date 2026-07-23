import { useParams } from "react-router-dom";

import { reports } from "../../data/reports";
import ReportHeader from "../../components/Reports/ReportHeader";
import OverallScoreCard from "../../components/Reports/OverallScoreCard";
import SnapshotCard from "../../components/Reports/SnapshotCard";
import QuestionFeedbackCard from "../../components/Reports/QuestionFeedbackCard";
import NextStepsCard from "../../components/Reports/NextStepsCard";





export default function ReportDetail() {

  const { id } = useParams();


  // temporary data
  // later replace with API call
  const report = reports.find(
    (item) => item.id === Number(id)
  );


  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-red-500">
          Report not found
        </p>
      </div>
    );
  }


  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">

      <div className="max-w-5xl mx-auto px-6 py-8">


        {/* Header */}

        <ReportHeader
          report={report}
        />


        {/* Score + Snapshot */}

        <div className="mt-0">

          <OverallScoreCard
            report={report}
          />

        </div>



        {/* Snapshot */}

        <div className="mt-6">

          <SnapshotCard
            report={report}
          />

        </div>



        {/* Question Feedback */}

        <div className="mt-6">

          <QuestionFeedbackCard
            question={report.question}
          />

        </div>



        {/* Next Steps */}

        <div className="mt-6">

          <NextStepsCard
            steps={report.nextSteps}
          />

        </div>


      </div>

    </div>

  );
}