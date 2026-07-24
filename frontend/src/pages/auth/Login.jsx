
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {


  const navigate = useNavigate();

const [showPassword, setShowPassword] = useState(false);

const [form, setForm] = useState({
  email: "",
  password: "",
});

const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  // Temporary until backend is ready
  navigate("/dashboard");
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-8">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sign in to continue your preparation.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* Email */}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}

          <div>

            <div className="flex justify-between mb-2">

              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>

              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </button>

            </div>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 pr-11 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
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

          {/* Remember */}

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

            <input
              type="checkbox"
              className="rounded"
            />

            Remember me

          </label>

          {/* Button */}

          <button
  type="submit"
  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium flex items-center justify-center gap-2 transition"
>
  Sign In
  <ArrowRight size={18} />
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

        {/* Google */}

     

        {/* Footer */}

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

