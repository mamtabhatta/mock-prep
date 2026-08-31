
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function QuestionHeader({
  sessionId,
  currentQuestion,
  onQuestionsLoaded,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/sessions/${sessionId}`
        );

        console.log(
          "Session response:",
          response.data
        );

        const session = response.data?.data;

        const fetchedQuestions =
          session?.questions || [];

        if (fetchedQuestions.length === 0) {
          setError(
            "No questions found for this session."
          );
          return;
        }

        setQuestions(fetchedQuestions);

        // Send questions to parent Interview component
        if (onQuestionsLoaded) {
          onQuestionsLoaded(fetchedQuestions);
        }

      } catch (err) {
        console.error(
          "Failed to fetch questions:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load questions."
        );
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchQuestions();
    }
  }, [sessionId, onQuestionsLoaded]);

  const question =
    questions[currentQuestion];

  if (loading) {
    return (
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-sm text-slate-400">
          Loading question...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-sm text-slate-400">
          Question not available.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-3xl mx-auto mb-14">

      {/* Question Type */}

      <p className="
        uppercase
        tracking-[5px]
        text-blue-400
        font-semibold
        text-sm
      ">
        {question.typeTag || "Mock Interview"}
      </p>

      {/* Question */}

      <h1 className="
        mt-5
        text-3xl
        sm:text-4xl
        lg:text-5xl
        font-bold
        leading-tight
        text-white
      ">
        {question.text}
      </h1>

    </div>
  );
}

