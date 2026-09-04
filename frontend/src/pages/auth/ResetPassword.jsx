import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import api from "../../api/api";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError("Password reset token is missing.");
            return;
        }

        if (!password) {
            setError("Please enter a new password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/reset-password",
                {
                    token,
                    password,
                }
            );

            setSuccess(
                response.data?.message ||
                "Password reset successful."
            );

            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                });
            }, 1500);
        } catch (err) {
            console.error(
                "Password reset failed:",
                err
            );

            const backendError =
                err.response?.data?.error;

            const message =
                backendError?.message ||
                err.response?.data?.message ||
                err.message ||
                "Unable to reset password.";

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
                    className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                    ← Back to Login
                </Link>

                <h1 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">
                    Reset Password
                </h1>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Create a new password for your account.
                </p>

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
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                disabled={loading}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(
                                        e.target.value
                                    );
                                    setError("");
                                }}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                disabled={loading}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (prev) => !prev
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}

                        {!loading && (
                            <ArrowRight size={18} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}