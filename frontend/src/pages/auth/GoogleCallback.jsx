import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const user = searchParams.get("user");

        if (!accessToken) {
            setError("Google login failed. Access token is missing.");
            return;
        }

        try {
            localStorage.setItem(
                "accessToken",
                accessToken
            );

            if (refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    refreshToken
                );
            }

            if (user) {
                const parsedUser = JSON.parse(user);

                localStorage.setItem(
                    "user",
                    JSON.stringify(parsedUser)
                );
            }

            navigate("/dashboard", {
                replace: true,
            });
        } catch (err) {
            console.error(
                "Google callback error:",
                err
            );

            setError(
                "Unable to complete Google login."
            );
        }
    }, [navigate, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-3xl border border-red-200 dark:border-red-900 bg-white dark:bg-gray-900 p-8 text-center">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Google Login Failed
                    </h1>

                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="text-center text-gray-600 dark:text-gray-400">
                <p className="text-sm">
                    Completing Google login...
                </p>
            </div>
        </div>
    );
}