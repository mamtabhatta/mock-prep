import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../api/api";

import ReportHeader from "../../components/Reports/ReportHeader";
import SnapshotCard from "../../components/Reports/SnapshotCard";
import QuestionFeedbackCard from "../../components/Reports/QuestionFeedbackCard";
import NextStepsCard from "../../components/Reports/NextStepsCard";

export default function ReportDetail() {
    const { id } = useParams();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/sessions/${id}`);
                

                setSession(response.data?.data || null);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load report."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading report...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Report not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            <div className="max-w-5xl mx-auto px-6 py-8">

                <ReportHeader
                    report={session}
                />

                <SnapshotCard
                    report={session}
                />

                <QuestionFeedbackCard
                    session={session}
                />

                <NextStepsCard
                    report={session}
                />

            </div>

        </div>
    );
}