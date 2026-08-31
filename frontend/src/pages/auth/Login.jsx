
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import api from "../../api/api";

export default function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const email = form.email.trim().toLowerCase();
        const password = form.password;

        // Validation
        if (!email) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        try {
            setLoading(true);

            console.log("Logging in...");

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password,
                }
            );

            console.log(
                "Login response:",
                response.data
            );

            const authData = response.data?.data;

            if (!authData) {
                throw new Error(
                    "Authentication data missing from server."
                );
            }

            if (!authData.accessToken) {
                throw new Error(
                    "Access token missing from server."
                );
            }

            // Save access token
            localStorage.setItem(
                "accessToken",
                authData.accessToken
            );

            // Save refresh token
            if (authData.refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    authData.refreshToken
                );
            }

            // Save user information
            if (authData.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(authData.user)
                );
            }

            console.log(
                "Login successful:",
                authData.user
            );

            console.log(
                "Access token saved:",
                !!localStorage.getItem(
                    "accessToken"
                )
            );

            console.log(
                "Refresh token saved:",
                !!localStorage.getItem(
                    "refreshToken"
                )
            );

            // Go to dashboard
            navigate("/dashboard", {
                replace: true,
            });

        } catch (err) {
            console.error(
                "Login failed:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            const backendError =
                err.response?.data?.error;

            const message =
                backendError?.message ||
                err.response?.data?.message ||
                err.message ||
                "Unable to login. Please try again.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="
            min-h-screen
            bg-gray-50
            dark:bg-gray-950
            flex
            items-center
            justify-center
            px-6
        ">

            <div className="
                w-full
                max-w-md
                bg-white
                dark:bg-gray-900
                border
                border-gray-200
                dark:border-gray-800
                rounded-3xl
                shadow-sm
                p-8
            ">

                {/* Header */}

                <h1 className="
                    text-2xl
                    font-bold
                    text-gray-900
                    dark:text-white
                ">
                    Welcome Back
                </h1>

                <p className="
                    mt-2
                    text-sm
                    text-gray-500
                    dark:text-gray-400
                ">
                    Sign in to continue your preparation.
                </p>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >

                    {/* Error */}

                    {error && (
                        <div className="
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-600
                            dark:border-red-900
                            dark:bg-red-950/30
                            dark:text-red-400
                        ">
                            {error}
                        </div>
                    )}

                    {/* Email */}

                    <div>
                        <label className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            dark:text-gray-300
                            mb-2
                        ">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                            autoComplete="email"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-gray-300
                                dark:border-gray-700
                                bg-white
                                dark:bg-gray-950
                                px-4
                                py-3
                                text-sm
                                text-gray-900
                                dark:text-white
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                disabled:opacity-60
                            "
                        />
                    </div>

                    {/* Password */}

                    <div>

                        <div className="
                            flex
                            justify-between
                            mb-2
                        ">

                            <label className="
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-300
                            ">
                                Password
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/forgot-password"
                                    )
                                }
                                disabled={loading}
                                className="
                                    text-xs
                                    text-blue-600
                                    hover:underline
                                    disabled:opacity-60
                                "
                            >
                                Forgot password?
                            </button>

                        </div>

                        <div className="relative">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                autoComplete="current-password"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    dark:border-gray-700
                                    bg-white
                                    dark:bg-gray-950
                                    px-4
                                    py-3
                                    pr-11
                                    text-sm
                                    text-gray-900
                                    dark:text-white
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    disabled:opacity-60
                                "
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-500
                                    hover:text-gray-700
                                    dark:hover:text-gray-300
                                "
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>
                    </div>

                    {/* Remember me */}

                    <label className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-600
                        dark:text-gray-400
                    ">

                        <input
                            type="checkbox"
                            className="rounded"
                            disabled={loading}
                        />

                        Remember me

                    </label>

                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            text-white
                            py-3
                            text-sm
                            font-medium
                            flex
                            items-center
                            justify-center
                            gap-2
                            transition
                        "
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In"}

                        {!loading && (
                            <ArrowRight size={18} />
                        )}

                    </button>

                </form>

              
{/* Divider */}

<div className="flex items-center gap-4 my-6">
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />

    <span className="text-xs uppercase text-gray-400">
        OR
    </span>

    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
</div>

{/* Signup */}

<p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
    Don't have an account?{" "}

    <Link
        to="/signup"
        className="font-medium text-blue-600 hover:underline"
    >
        Create Account
    </Link>
</p>

</div>
</div>
);
}

