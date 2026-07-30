import React from "react";
import { Play } from "lucide-react";

function UniversityTable({
    universities,
    expandedUniversity,
    handleToggle,
    onAddQuestion,
    onEditUniversity,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                            <th className="px-6 py-3.5">University</th>
                            <th className="px-6 py-3.5">Courses</th>
                            <th className="px-6 py-3.5">Questions</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Last Updated</th>
                            <th className="px-6 py-3.5 text-right pr-8">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {universities.map((uni) => {
                            const isExpanded = expandedUniversity === uni.id;

                            return (
                                <React.Fragment key={uni.id}>
                                    {/* Primary Row */}
                                    <tr
                                        className={`transition-colors ${isExpanded ? "bg-blue-50/40" : "hover:bg-slate-50/50"
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggle(uni.id)}
                                                className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition-colors"
                                            >
                                                <Play
                                                    size={10}
                                                    className={`fill-current text-slate-700 transition-transform duration-150 ${isExpanded ? "rotate-90" : "rotate-0"
                                                        }`}
                                                />
                                                <span>{uni.name}</span>
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {uni.coursesCount || uni.courses}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {uni.questionsCount || uni.questions}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${uni.status === "Active"
                                                        ? "bg-emerald-100/70 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                    }`}
                                            >
                                                {uni.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-slate-400">{uni.updated}</td>

                                        <td className="px-6 py-4 text-right pr-8">
                                            <button
                                                onClick={() => {
                                                    handleToggle(uni.id);
                                                    if (onEditUniversity) onEditUniversity(uni);
                                                }}
                                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline text-sm"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Nested Courses Rows */}
                                    {isExpanded &&
                                        uni.courseList?.map((course, idx) => (
                                            <tr
                                                key={course.id || idx}
                                                className="bg-slate-50/30 border-b border-slate-100/60 last:border-b-0"
                                            >
                                                <td colSpan={5} className="pl-14 pr-6 py-3">
                                                    <div className="flex items-center text-sm">
                                                        <span className="font-semibold text-slate-800">
                                                            {course.title}
                                                        </span>
                                                        <span className="mx-1 text-slate-400">•</span>
                                                        <span className="text-slate-400">
                                                            {course.questionCount} questions
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right pr-8">
                                                    <button
                                                        onClick={() => onAddQuestion && onAddQuestion(uni, course)}
                                                        className="text-xs font-bold text-blue-600 hover:underline"
                                                    >
                                                        + Add Question
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Responsive View */}
            <div className="lg:hidden divide-y divide-slate-100">
                {universities.map((uni) => {
                    const isExpanded = expandedUniversity === uni.id;

                    return (
                        <div key={uni.id} className="p-4 space-y-3">
                            <button
                                onClick={() => handleToggle(uni.id)}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Play
                                            size={10}
                                            className={`fill-current text-slate-700 transition-transform duration-150 ${isExpanded ? "rotate-90" : "rotate-0"
                                                }`}
                                        />
                                        <h3 className="font-bold text-slate-800">{uni.name}</h3>
                                    </div>
                                    <p className="mt-1 pl-4 text-xs text-slate-500">
                                        {uni.coursesCount || uni.courses} Courses • {uni.questionsCount || uni.questions} Questions
                                    </p>
                                </div>
                            </button>

                            <div className="flex items-center justify-between pl-4 pt-1">
                                <span
                                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${uni.status === "Active"
                                            ? "bg-emerald-100/70 text-emerald-700"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                >
                                    {uni.status}
                                </span>

                                <button
                                    onClick={() => handleToggle(uni.id)}
                                    className="font-medium text-blue-600 text-sm"
                                >
                                    Edit
                                </button>
                            </div>

                            {/* Nested Mobile Courses */}
                            {isExpanded && (
                                <div className="mt-3 pl-4 space-y-2 border-t border-slate-100 pt-3">
                                    {uni.courseList?.map((course, idx) => (
                                        <div
                                            key={course.id || idx}
                                            className="flex items-center justify-between text-xs py-1"
                                        >
                                            <div>
                                                <span className="font-semibold text-slate-800">
                                                    {course.title}
                                                </span>
                                                <span className="text-slate-400">
                                                    {" "}• {course.questionCount} questions
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => onAddQuestion && onAddQuestion(uni, course)}
                                                className="font-bold text-blue-600"
                                            >
                                                + Add Question
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default UniversityTable;