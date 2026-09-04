import {
    ArrowRight,
    Loader2,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";

import api from "../../api/api";

function ContinueInterview({
    universityId,
    courseId,
    questionSetId,
    format,
    file,
}) {
    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(false);

    const handleContinue = async () => {
        if (!universityId) {
            alert("Please select a university.");
            return;
        }

        if (!courseId) {
            alert("Please select a course.");
            return;
        }

        if (!questionSetId) {
            alert("Please select a question set.");
            return;
        }

        if (!format) {
            alert("Please select an interview format.");
            return;
        }

        try {
            setLoading(true);

            // ============================================
            // CREATE SESSION
            // ============================================

            const response = await api.post(
                "/sessions",
                {
                    module: "interview",
                    universityId,
                    courseId,
                    questionSetId,
                    interviewFormat: format,
                }
            );

            const sessionId =
                response.data?.data?.id;

            if (!sessionId) {
                throw new Error(
                    "Session ID was not returned by the server."
                );
            }

            console.log(
                "Session created:",
                sessionId
            );

            console.log(
                "Interview format:",
                format
            );

            // ============================================
            // UPLOAD CV
            // ============================================

            if (file) {
                console.log("Uploading CV...");

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );

                formData.append(
                    "documentType",
                    "cv"
                );

                const uploadResponse =
                    await api.post(
                        `/sessions/${sessionId}/documents`,
                        formData
                    );

                console.log(
                    "CV upload response:",
                    uploadResponse.data
                );
            }

            // ============================================
            // SAVE FORMAT FOR UI
            // ============================================

            sessionStorage.setItem(
                `interviewFormat_${sessionId}`,
                format
            );

            // ============================================
            // NAVIGATE TO INTERVIEW
            // ============================================

            navigate(
                `/dashboard/interview/${sessionId}`
            );

        } catch (error) {
            console.error(
                "Failed to start interview:",
                error
            );

            console.log(
                "STATUS:",
                error.response?.status
            );

            console.log(
                "DATA:",
                error.response?.data
            );

            console.log(
                "HEADERS:",
                error.response?.headers
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to start the interview."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleContinue}
            disabled={
                loading ||
                !universityId ||
                !courseId ||
                !questionSetId ||
                !format
            }
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
                dark:focus:ring-offset-slate-900
            "
        >
            {loading ? (
                <>
                    <Loader2
                        size={16}
                        className="animate-spin"
                    />

                    Starting Interview...
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

export default ContinueInterview;