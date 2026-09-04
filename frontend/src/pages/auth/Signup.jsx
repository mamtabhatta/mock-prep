
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import api from "../../api/api";

export default function Signup() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
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

        const fullName = form.name.trim();
        const email = form.email.trim().toLowerCase();
        const password = form.password;
        const confirmPassword = form.confirmPassword;

        // Validation

        if (!fullName) {
            setError("Please enter your full name.");
            return;
        }

        if (fullName.length < 2) {
            setError(
                "Full name must be at least 2 characters."
            );
            return;
        }

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please create a password.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/register",
                {
                    fullName,
                    email,
                    password,
                }
            );

            console.log(
                "Registration response:",
                response.data
            );

            const authData = response.data?.data;

            if (!authData) {
                throw new Error(
                    "Registration data missing from server."
                );
            }

            // Save access token

            if (authData.accessToken) {
                localStorage.setItem(
                    "accessToken",
                    authData.accessToken
                );
            }

            // Save refresh token

            if (authData.refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    authData.refreshToken
                );
            }

            // Save user

            if (authData.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(authData.user)
                );
            }

            navigate("/dashboard", {
                replace: true,
            });
        } catch (err) {
            console.error(
                "Registration failed:",
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
                "Unable to create account. Please try again.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Continue with Google

    const handleGoogleSignup = () => {
        setError("");
        setGoogleLoading(true);

        const apiUrl = import.meta.env.VITE_API_URL;

        window.location.href = `${apiUrl}/auth/google`;
    };

    return (
        <div
            className="
                min-h-screen
                bg-gray-50
                dark:bg-gray-950
                flex
                items-center
                justify-center
                px-6
            "
        >
            <div
                className="
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
                "
            >
                {/* Header */}

                <h1
                    className="
                        text-2xl
                        font-bold
                        text-gray-900
                        dark:text-white
                    "
                >
                    Create Account
                </h1>

                <p
                    className="
                        mt-2
                        text-sm
                        text-gray-500
                        dark:text-gray-400
                    "
                >
                    Join MockPrep and start improving
                    your interview skills.
                </p>

                {/* Error */}

                {error && (
                    <div
                        className="
                            mt-6
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
                        "
                    >
                        {error}
                    </div>
                )}

                {/* Google Signup */}

                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading || googleLoading}
                    className="
                        mt-8
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        dark:border-gray-700
                        bg-white
                        dark:bg-gray-950
                        text-gray-800
                        dark:text-gray-200
                        py-3
                        text-sm
                        font-medium
                        flex
                        items-center
                        justify-center
                        gap-3
                        transition
                        hover:bg-gray-50
                        dark:hover:bg-gray-800
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {!googleLoading && (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                fill="#4285F4"
                                d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.15c1.84-1.69 2.91-4.18 2.91-7.42z"
                            />

                            <path
                                fill="#34A853"
                                d="M12 21.92c2.63 0 4.84-.87 6.45-2.37l-3.15-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.69-1.72-5.46-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.92z"
                            />

                            <path
                                fill="#FBBC05"
                                d="M6.54 13.99a5.86 5.86 0 0 1 0-3.73V7.73H3.28a9.97 9.97 0 0 0 0 8.8l3.26 2.54z"
                            />

                            <path
                                fill="#EA4335"
                                d="M12 6.23c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.31 14.63 2.42 12 2.42a9.74 9.74 0 0 0-8.72 5.31l3.26 2.53C7.31 7.95 9.46 6.23 12 6.23z"
                            />
                        </svg>
                    )}

                    {googleLoading
                        ? "Connecting to Google..."
                        : "Continue with Google"}
                </button>

                {/* Divider */}

                <div className="flex items-center gap-4 my-6">
                    <div
                        className="
                            flex-1
                            h-px
                            bg-gray-200
                            dark:bg-gray-700
                        "
                    />

                    <span className="text-xs uppercase text-gray-400">
                        OR
                    </span>

                    <div
                        className="
                            flex-1
                            h-px
                            bg-gray-200
                            dark:bg-gray-700
                        "
                    />
                </div>

                {/* Signup Form */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Full Name */}

                    <div>
                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-300
                                mb-2
                            "
                        >
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
                            autoComplete="name"
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

                    {/* Email */}

                    <div>
                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-300
                                mb-2
                            "
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
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
                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-300
                                mb-2
                            "
                        >
                            Password
                        </label>

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
                                placeholder="Create a password"
                                required
                                disabled={
                                    loading ||
                                    googleLoading
                                }
                                autoComplete="new-password"
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
                                disabled={
                                    loading ||
                                    googleLoading
                                }
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

                    {/* Confirm Password */}

                    <div>
                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-300
                                mb-2
                            "
                        >
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                type={
                                    showConfirm
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                value={
                                    form.confirmPassword
                                }
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                disabled={
                                    loading ||
                                    googleLoading
                                }
                                autoComplete="new-password"
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
                                    setShowConfirm(
                                        (prev) => !prev
                                    )
                                }
                                disabled={
                                    loading ||
                                    googleLoading
                                }
                                aria-label={
                                    showConfirm
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
                                {showConfirm ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}

                    <label
                        className="
                            flex
                            items-start
                            gap-2
                            text-sm
                            text-gray-600
                            dark:text-gray-400
                        "
                    >
                        <input
                            type="checkbox"
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="mt-1 rounded"
                        />

                        <span>
                            I agree to the{" "}

                            <span
                                className="
                                    text-blue-600
                                    cursor-pointer
                                    hover:underline
                                "
                            >
                                Terms & Conditions
                            </span>
                        </span>
                    </label>

                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            googleLoading
                        }
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
                            ? "Creating Account..."
                            : "Create Account"}

                        {!loading && (
                            <ArrowRight size={18} />
                        )}
                    </button>
                </form>

                {/* Footer */}

                <p
                    className="
                        mt-8
                        text-center
                        text-sm
                        text-gray-500
                        dark:text-gray-400
                    "
                >
                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="
                            font-medium
                            text-blue-600
                            hover:underline
                        "
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

