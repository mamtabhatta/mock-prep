import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import api from "../../api/api";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setError("Please enter your email.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: cleanEmail,
                }
            );

            const resetUrl =
                response.data?.data?.resetUrl;

            if (!resetUrl) {
                throw new Error(
                    "Reset link was not generated."
                );
            }

            const url = new URL(resetUrl);

            navigate(
                `${url.pathname}${url.search}`,
                {
                    replace: true,
                }
            );
        } catch (err) {
            console.error(
                "Forgot password failed:",
                err
            );

            const backendError =
                err.response?.data?.error;

            const message =
                backendError?.message ||
                err.response?.data?.message ||
                err.message ||
                "Unable to process your request.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="mt-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                        <Mail size={22} />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                        Forgot Password?
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        Enter your email address and we'll generate a
                        password reset link for you.
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}

                        {!loading && (
                            <ArrowRight size={18} />
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}