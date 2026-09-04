import { useEffect } from "react";
import { GraduationCap, Wrench } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Entry() {
    const navigate = useNavigate();

    useEffect(() => {
        const restoreSession = async () => {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!accessToken && !refreshToken) {
                return;
            }

            if (accessToken) {
                navigate("/dashboard", { replace: true });
                return;
            }

            try {
                const response = await api.post("/auth/refresh", {
                    refreshToken,
                });

                const data = response.data?.data;

                if (!data?.accessToken) {
                    throw new Error("Session restoration failed");
                }

                localStorage.setItem(
                    "accessToken",
                    data.accessToken
                );

                if (data.refreshToken) {
                    localStorage.setItem(
                        "refreshToken",
                        data.refreshToken
                    );
                }

                navigate("/dashboard", { replace: true });
            } catch (error) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
            }
        };

        restoreSession();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10 transition-colors duration-300 dark:bg-slate-950">
            <div className="w-full max-w-4xl">
                <div className="mb-10 text-center">
                    <div className="mb-6 flex items-center justify-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
                            M
                        </div>

                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            MockPrep
                        </h1>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Welcome back
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Choose how you'd like to continue
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Link
                        to="/signup"
                        className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:shadow-black/20"
                    >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <GraduationCap
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                            I'm a Student
                        </h3>

                        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Practice interviews and IELTS speaking tests with
                            AI-powered feedback to improve your confidence.
                        </p>

                        <span className="mt-5 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:gap-1 dark:text-blue-400">
                            Continue as student
                            <span className="ml-1">→</span>
                        </span>
                    </Link>

                    <a
                        href="http://localhost:5174/admin/dashboard"
                        className="group block rounded-2xl border border-blue-600 bg-blue-600 p-6 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white dark:bg-blue-500">
                            <Wrench
                                size={21}
                                strokeWidth={1.8}
                            />
                        </div>

                        <h3 className="mb-2 text-lg font-semibold">
                            Super Admin
                        </h3>

                        <p className="text-sm leading-6 text-blue-100">
                            Manage universities, interview questions, IELTS
                            modules, and AI evaluation settings.
                        </p>

                        <span className="mt-5 inline-flex items-center text-sm font-medium transition group-hover:gap-1">
                            Continue as admin
                            <span className="ml-1">→</span>
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Entry;