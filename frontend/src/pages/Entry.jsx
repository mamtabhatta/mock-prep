import { GraduationCap, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

function Entry() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              M
            </div>

            <h1 className="text-4xl font-bold text-slate-900">
              MockPrep
            </h1>
          </div>

          <h2 className="text-5xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="mt-3 text-lg text-slate-500">
            Choose how you'd like to continue
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Student */}
          <Link
            to="/signup"
            className="block bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-8">
              <GraduationCap size={32} className="text-slate-700" />
            </div>

            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              I'm a Student
            </h3>

            <p className="text-slate-500 leading-8 text-lg">
              Practice interviews & IELTS speaking tests with AI-powered
              feedback to improve your confidence.
            </p>

            <span className="inline-block mt-8 text-blue-600 font-semibold text-lg hover:underline">
              Continue as student →
            </span>
          </Link>

          {/* Admin */}
          {/* Admin */}
          <a
            href="http://localhost:5174/admin/dashboard"
            className="block rounded-3xl bg-blue-600 p-8 text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-300"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500">
              <Wrench size={30} />
            </div>

            <h3 className="mb-4 text-3xl font-bold">
              Super Admin
            </h3>

            <p className="text-lg leading-8 text-blue-100">
              Manage universities, interview questions, IELTS modules and AI
              evaluation settings.
            </p>

            <span className="mt-8 inline-block text-lg font-semibold hover:underline">
              Continue as admin →
            </span>
          </a>
          {/* </Link> */}

        </div>
      </div>
    </div>
  );
}

export default Entry;