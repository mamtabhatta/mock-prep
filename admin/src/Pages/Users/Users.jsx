import React from "react";

const usersData = [
    {
        id: 1,
        name: "Aashish Gurung",
        role: "Student",
        sessions: 12,
        joined: "Jun 2026",
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "Student",
        sessions: 8,
        joined: "Jun 2026",
    },
    {
        id: 3,
        name: "Bikash Thapa",
        role: "Student",
        sessions: 21,
        joined: "May 2026",
    },
    {
        id: 4,
        name: "Sita Rai",
        role: "Student",
        sessions: 5,
        joined: "Jul 2026",
    },
    {
        id: 5,
        name: "Admin Team",
        role: "Admin",
        sessions: "—",
        joined: "Jan 2026",
    },
];

export default function Users() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans p-8 flex-1">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        All registered students and admins.
                    </p>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="py-3.5 px-6 font-bold">NAME</th>
                                <th className="py-3.5 px-6 font-bold">ROLE</th>
                                <th className="py-3.5 px-6 font-bold">SESSIONS</th>
                                <th className="py-3.5 px-6 font-bold">JOINED</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usersData.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="py-4 px-6 font-bold text-slate-900">
                                        {user.name}
                                    </td>
                                    <td className="py-4 px-6 text-slate-500">{user.role}</td>
                                    <td className="py-4 px-6 text-slate-500">{user.sessions}</td>
                                    <td className="py-4 px-6 text-slate-500">{user.joined}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}