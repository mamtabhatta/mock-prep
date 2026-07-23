import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ContinueButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/dashboard/interview")}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
        >
            Continue to Interview
            <ArrowRight size={18} />
        </button>
    );
}

export default ContinueButton;