
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/api";

function ContinueButton({
    universityId,
    courseId,
    questionSetId,
}) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        try {
            setLoading(true);

            const response = await api.post("/sessions", {
                module: "interview",
                universityId,
                courseId,
                questionSetId,
            });

            const sessionId = response.data.data.id;

            navigate(`/dashboard/interview/${sessionId}`);

        } catch (error) {
            console.error(
                "Failed to create session:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-blue-700
                hover:shadow
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
            "
        >
            {loading ? (
                <>
                    <Loader2
                        size={16}
                        className="animate-spin"
                    />

                    Creating Interview...
                </>
            ) : (
                <>
                    Continue to Interview

                    <ArrowRight
                        size={16}
                        strokeWidth={2}
                    />
                </>
            )}
        </button>
    );
}

export default ContinueButton;

