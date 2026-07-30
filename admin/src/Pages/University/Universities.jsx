import React, { useState } from "react";
import { universitiesData } from "../../Data/universityData";

export default function Universities() {

    const [expandedId, setExpandedId] = useState(2); 

    const handleToggle = (id) => {
        setExpandedId((prevId) => (prevId === id ? null : id));
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans p-10 flex-1">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Universities
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-normal">
                            Manage universities, courses and question banks.
                        </p>
                    </div>

                    <button className="bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm">
                        + Add University
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                                <th className="py-4 px-8 font-semibold">UNIVERSITY</th>
                                <th className="py-4 px-8 font-semibold">COURSES</th>
                                <th className="py-4 px-8 font-semibold">QUESTIONS</th>
                                <th className="py-4 px-8 font-semibold">STATUS</th>
                                <th className="py-4 px-8 font-semibold">LAST UPDATED</th>
                                <th className="py-4 px-8 font-semibold">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {universitiesData.map((uni) => {
                                const isExpanded = expandedId === uni.id;

                                return (
                                    <React.Fragment key={uni.id}>
                                        {/* Main Row */}
                                        <tr
                                            onClick={() => handleToggle(uni.id)}
                                            className={`cursor-pointer transition-colors ${isExpanded ? "bg-[#f0f5ff]" : "hover:bg-slate-50"
                                                }`}
                                        >
                                            <td className="py-5 px-8 font-bold text-slate-900">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-[10px] text-slate-700 select-none">
                                                        {isExpanded ? "▼" : "▶"}
                                                    </span>
                                                    {uni.name}
                                                </div>
                                            </td>
                                            <td className="py-5 px-8 text-slate-600 font-normal">
                                                {uni.coursesCount}
                                            </td>
                                            <td className="py-5 px-8 text-slate-600 font-normal">
                                                {uni.questionsCount}
                                            </td>
                                            <td className="py-5 px-8">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${uni.status === "Active"
                                                            ? "bg-emerald-100/80 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    {uni.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8 text-slate-500 font-normal">
                                                {uni.lastUpdated}
                                            </td>
                                            <td className="py-5 px-8">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggle(uni.id);
                                                    }}
                                                    className="text-[#2563eb] font-semibold hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Course Rows */}
                                        {isExpanded &&
                                            uni.courses.map((course) => (
                                                <tr
                                                    key={course.id}
                                                    className="bg-[#f8fafc]/80 border-t border-slate-100"
                                                >
                                                    <td colSpan="5" className="py-3.5 pl-16 pr-8 text-slate-600">
                                                        <span className="font-semibold text-slate-800">
                                                            {course.name}
                                                        </span>{" "}
                                                        ·{" "}
                                                        <span className="text-slate-500 font-normal">
                                                            {course.questions} questions
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-8">
                                                        <button className="text-[#2563eb] font-semibold text-xs hover:underline whitespace-nowrap">
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
            </div>
        </div>
    );
}